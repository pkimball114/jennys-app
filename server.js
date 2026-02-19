const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const express = require("express");
const cors = require("cors");

const app = express();
const http = require("http").createServer(app);
const port = process.env.PORT || 5000;

const INTRO_TRACK_COUNT = 15;
const DEFAULT_YT_DLP_COMMAND = process.env.YT_DLP_PATH || "yt-dlp";

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    ffmpeg.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("error", (error) => {
      reject(error);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
    });
  });
}

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn(DEFAULT_YT_DLP_COMMAND, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    let stdout = "";

    ytDlp.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    ytDlp.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ytDlp.on("error", (error) => {
      reject(error);
    });

    ytDlp.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const commandText = `${DEFAULT_YT_DLP_COMMAND} ${args.join(" ")}`;
      const err = new Error(
        `yt-dlp exited with code ${code}. Command: ${commandText}\n${stderr || stdout}`
      );
      err.exitCode = code;
      reject(err);
    });
  });
}

function getYtDlpDiagnostics() {
  const whichResult = spawnSync("which", [DEFAULT_YT_DLP_COMMAND], { encoding: "utf8" });
  const versionResult = spawnSync(DEFAULT_YT_DLP_COMMAND, ["--version"], { encoding: "utf8" });

  const whichText = whichResult.status === 0
    ? (whichResult.stdout || "").trim()
    : `not found (${(whichResult.stderr || whichResult.error?.message || "").trim() || "unknown"})`;

  const versionText = versionResult.status === 0
    ? (versionResult.stdout || "").trim()
    : `unavailable (${(versionResult.stderr || versionResult.error?.message || "").trim() || "unknown"})`;

  return { whichText, versionText };
}

async function downloadAudioSource(videoURL, outputPath) {
  const baseArgs = [
    "-f",
    "bestaudio/best",
    "--no-playlist",
    "--no-progress",
    "--force-overwrites",
    "-o",
    outputPath,
    videoURL,
  ];

  try {
    await runYtDlp(baseArgs);
    return;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw error;
    }
  }

  await runYtDlp([
    ...baseArgs.slice(0, 4),
    "--extractor-args",
    "youtube:player_client=android",
    ...baseArgs.slice(4),
  ]);
}

function getClipUrl(clip) {
  if (clip.url && typeof clip.url === "string") {
    return clip.url.trim();
  }
  if (clip.videoId && typeof clip.videoId === "string") {
    return `https://www.youtube.com/watch?v=${clip.videoId.trim()}`;
  }
  return "";
}

function parseSeconds(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return NaN;
}

function validateRoundInput(body) {
  if (!body || !Array.isArray(body.clips) || body.clips.length === 0) {
    return "Request body must include a non-empty clips array.";
  }

  for (let i = 0; i < body.clips.length; i += 1) {
    const clip = body.clips[i] || {};
    const url = getClipUrl(clip);
    const startSeconds = parseSeconds(clip.startSeconds ?? clip.startTime);
    const endSeconds = parseSeconds(clip.endSeconds ?? clip.endTime);

    if (!url) {
      return `Clip ${i + 1} is missing url (or videoId).`;
    }
    if (!Number.isFinite(startSeconds) || startSeconds < 0) {
      return `Clip ${i + 1} has invalid startSeconds.`;
    }
    if (!Number.isFinite(endSeconds) || endSeconds <= startSeconds) {
      return `Clip ${i + 1} has invalid endSeconds (must be > startSeconds).`;
    }
  }

  return null;
}

async function trimClipToMp3(sourcePath, outputPath, startSeconds, endSeconds) {
  const durationSeconds = endSeconds - startSeconds;

  await runFfmpeg([
    "-y",
    "-ss",
    String(startSeconds),
    "-t",
    String(durationSeconds),
    "-i",
    sourcePath,
    "-vn",
    "-ac",
    "2",
    "-ar",
    "44100",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outputPath,
  ]);
}

async function renderRoundMp3(clips, tempDir) {
  const concatInputs = [];

  for (let i = 0; i < clips.length; i += 1) {
    const clip = clips[i];
    const clipUrl = getClipUrl(clip);
    const startSeconds = parseSeconds(clip.startSeconds ?? clip.startTime);
    const endSeconds = parseSeconds(clip.endSeconds ?? clip.endTime);
    const sourcePath = path.join(tempDir, `source-${i + 1}.m4a`);
    const clippedPath = path.join(tempDir, `clip-${i + 1}.mp3`);
    const introIndex = (i % INTRO_TRACK_COUNT) + 1;
    const introPath = path.join(__dirname, "public", `number_${introIndex}.mp3`);

    await fsp.access(introPath, fs.constants.R_OK);
    await downloadAudioSource(clipUrl, sourcePath);
    await trimClipToMp3(sourcePath, clippedPath, startSeconds, endSeconds);

    concatInputs.push(introPath);
    concatInputs.push(clippedPath);
  }

  const outputPath = path.join(tempDir, "round-render.mp3");
  const ffmpegArgs = ["-y"];

  concatInputs.forEach((inputPath) => {
    ffmpegArgs.push("-i", inputPath);
  });

  const concatFilter = concatInputs
    .map((_, index) => `[${index}:a]`)
    .join("") + `concat=n=${concatInputs.length}:v=0:a=1[outa]`;

  ffmpegArgs.push(
    "-filter_complex",
    concatFilter,
    "-map",
    "[outa]",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outputPath
  );

  await runFfmpeg(ffmpegArgs);
  return outputPath;
}

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/api/rounds/render", async (req, res) => {
  const validationError = validateRoundInput(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "music-round-"));

  try {
    const outputPath = await renderRoundMp3(req.body.clips, tempDir);
    const filename = `music-round-${Date.now()}.mp3`;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.download(outputPath, filename, async (error) => {
      await fsp.rm(tempDir, { recursive: true, force: true });

      if (error && !res.headersSent) {
        console.error("Download failed:", error);
        res.status(500).json({ error: "Failed to send rendered MP3 file." });
      }
    });
  } catch (error) {
    console.error("Round render failed:", error);
    await fsp.rm(tempDir, { recursive: true, force: true });

    const isFfmpegMissing = error && error.code === "ENOENT" && /ffmpeg/i.test(String(error.message || ""));
    const isYtDlpMissing = error && error.code === "ENOENT" && /yt-dlp/i.test(String(error.message || ""));
    const ytDlpDiagnostics = getYtDlpDiagnostics();

    res.status(500).json({
      error: isYtDlpMissing
        ? "yt-dlp is not installed or not in PATH."
        : isFfmpegMissing
          ? "ffmpeg is not installed or not in PATH."
          : "Failed to render round MP3.",
      details: String(error.message || error),
      ytDlp: {
        command: DEFAULT_YT_DLP_COMMAND,
        which: ytDlpDiagnostics.whichText,
        version: ytDlpDiagnostics.versionText,
      },
    });
  }
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
