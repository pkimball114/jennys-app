import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import YouTubePlayer from './YouTubePlayer';
import InputForm from './InputForm';
import VideoTable from './VideoTable';
import { downloadJsonFile, toSeconds } from './Utils';

const ROUND_STORAGE_KEY = 'musicRound.tableData.v1';

function normalizeYouTubeUrl(input) {
  if (!input) {
    return { videoId: '', normalizedUrl: '' };
  }

  const trimmedInput = String(input).trim();
  const rawVideoIdPattern = /^[a-zA-Z0-9_-]{11}$/;

  if (rawVideoIdPattern.test(trimmedInput)) {
    return {
      videoId: trimmedInput,
      normalizedUrl: `https://www.youtube.com/watch?v=${trimmedInput}`,
    };
  }

  try {
    const parsedUrl = new URL(trimmedInput);
    let parsedVideoId = '';

    if (parsedUrl.hostname === 'youtu.be') {
      parsedVideoId = parsedUrl.pathname.replace('/', '').split('/')[0];
    } else if (
      parsedUrl.hostname === 'youtube.com' ||
      parsedUrl.hostname === 'www.youtube.com' ||
      parsedUrl.hostname === 'm.youtube.com'
    ) {
      if (parsedUrl.pathname === '/watch') {
        parsedVideoId = parsedUrl.searchParams.get('v') || '';
      } else if (parsedUrl.pathname.startsWith('/embed/')) {
        parsedVideoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] || '';
      } else if (parsedUrl.pathname.startsWith('/shorts/')) {
        parsedVideoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      }
    }

    if (rawVideoIdPattern.test(parsedVideoId)) {
      return {
        videoId: parsedVideoId,
        normalizedUrl: `https://www.youtube.com/watch?v=${parsedVideoId}`,
      };
    }
  } catch (_error) {
    // Invalid URL path; fall through to empty result.
  }

  return { videoId: '', normalizedUrl: '' };
}

function normalizeClipRow(rawRow) {
  const row = rawRow || {};
  const urlCandidate = row.url || row.videoId || '';
  const normalizedUrl = normalizeYouTubeUrl(urlCandidate);

  const startRaw = row.startTime ?? row.startSeconds ?? 0;
  const endRaw = row.endTime ?? row.endSeconds ?? 0;
  const startTime = toSeconds(startRaw);
  const endTime = toSeconds(endRaw);

  return {
    url: normalizedUrl.normalizedUrl || (typeof row.url === 'string' ? row.url : ''),
    videoId: normalizedUrl.videoId || (typeof row.videoId === 'string' ? row.videoId : ''),
    songTitle: row.songTitle ?? '',
    artist: row.artist ?? '',
    videoTitle: row.videoTitle ?? '',
    startTime: Number.isFinite(startTime) ? startTime : 0,
    endTime: Number.isFinite(endTime) ? endTime : 0,
    audioUrl: row.audioUrl ?? null,
  };
}

function App() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [roundName, setRoundName] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [isGeneratingMp3, setIsGeneratingMp3] = useState(false);
  const [generateMp3Error, setGenerateMp3Error] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const savedRound = localStorage.getItem(ROUND_STORAGE_KEY);
      if (!savedRound) {
        return;
      }

      const parsed = JSON.parse(savedRound);
      const importedRows = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.videos)
          ? parsed.videos
          : Array.isArray(parsed?.clips)
            ? parsed.clips
            : null;

      if (typeof parsed?.roundName === 'string') {
        setRoundName(parsed.roundName);
      }

      if (importedRows) {
        const normalizedRows = importedRows.map((row) => normalizeClipRow(row));
        setVideos(normalizedRows);
      }
    } catch (error) {
      console.error('Error restoring saved round:', error);
    }
  }, []);

  useEffect(() => {
    try {
      const payload = { roundName, videos };
      localStorage.setItem(ROUND_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Error saving round:', error);
    }
  }, [roundName, videos]);

  const addVideo = (video) => {
    const normalized = normalizeClipRow(video);
    setVideos((prevVideos) => [...prevVideos, normalized]);
    setSelectedVideo(normalized);
  };

  const moveRow = (index, direction) => {
    const newPosition = index + direction;
    if (newPosition < 0 || newPosition >= videos.length) {
      return;
    }

    setVideos((prevVideos) => {
      const next = [...prevVideos];
      const [removed] = next.splice(index, 1);
      next.splice(newPosition, 0, removed);
      return next;
    });
  };

  const removeVideo = (index) => {
    setVideos((prevVideos) => {
      const toRemove = prevVideos[index];
      const updated = prevVideos.filter((_, i) => i !== index);

      if (selectedVideo && toRemove && selectedVideo.url === toRemove.url && selectedVideo.startTime === toRemove.startTime && selectedVideo.endTime === toRemove.endTime) {
        setSelectedVideo(null);
      }

      return updated;
    });
  };

  const previewVideo = (video) => {
    setSelectedVideo(video);
    setPreviewNonce((prev) => prev + 1);
  };

  const updatePreview = (url) => {
    const normalized = normalizeYouTubeUrl(url);
    if (!normalized.videoId) {
      setSelectedVideo(null);
      return;
    }

    setSelectedVideo((current) => ({
      ...(current || {}),
      url: normalized.normalizedUrl,
      videoId: normalized.videoId,
      startTime: 0,
      endTime: 0,
    }));
  };

  const updatePreviewWithTimestamps = (url, startTime, endTime) => {
    const normalized = normalizeYouTubeUrl(url);
    if (!normalized.videoId) {
      return;
    }

    setSelectedVideo((current) => ({
      ...(current || {}),
      url: normalized.normalizedUrl,
      videoId: normalized.videoId,
      startTime,
      endTime,
    }));
    setPreviewNonce((prev) => prev + 1);
  };

  const copyUrl = async (index) => {
    const row = videos[index];
    const normalized = normalizeYouTubeUrl(row?.url || row?.videoId || '');
    const urlToCopy = normalized.normalizedUrl || row?.url || row?.videoId || '';

    if (!urlToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleLoadPreviousRounds = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const fileContents = await file.text();
      const parsedJson = JSON.parse(fileContents);
      const importedRows = Array.isArray(parsedJson)
        ? parsedJson
        : Array.isArray(parsedJson?.clips)
          ? parsedJson.clips
          : Array.isArray(parsedJson?.videos)
            ? parsedJson.videos
            : null;

      if (!importedRows) {
        throw new Error('JSON does not contain a valid clips or videos array.');
      }

      const normalizedRows = importedRows.map((row) => normalizeClipRow(row));
      setVideos(normalizedRows);
      setSelectedVideo(null);

      if (typeof parsedJson?.roundName === 'string') {
        setRoundName(parsedJson.roundName);
      }
    } catch (error) {
      console.error('Error importing round JSON:', error);
      alert('Failed to load the file: Invalid or unsupported JSON format.');
    } finally {
      event.target.value = '';
    }
  };

  const handleExportRoundJsonClick = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      roundName,
      videos,
      clips: videos,
    };

    const filename = `${(roundName || 'Music_Trivia_Round').replace(/\s+/g, '_')}.json`;
    downloadJsonFile(JSON.stringify(payload, null, 2), filename);
  };

  const handleGenerateMp3Click = async () => {
    setGenerateMp3Error('');

    if (videos.length === 0) {
      setGenerateMp3Error('Add at least one clip before generating MP3.');
      return;
    }

    const renderClips = [];
    for (let i = 0; i < videos.length; i += 1) {
      const row = videos[i];
      const normalized = normalizeYouTubeUrl(row.url || row.videoId || '');
      const clipUrl = normalized.normalizedUrl || row.url || row.videoId || '';

      if (!clipUrl) {
        setGenerateMp3Error(`Clip ${i + 1} has an invalid YouTube URL/ID.`);
        return;
      }

      if (!Number.isFinite(row.startTime) || !Number.isFinite(row.endTime) || row.endTime <= row.startTime) {
        setGenerateMp3Error(`Clip ${i + 1} has invalid start/end time.`);
        return;
      }

      renderClips.push({
        url: clipUrl,
        startSeconds: row.startTime,
        endSeconds: row.endTime,
      });
    }

    setIsGeneratingMp3(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/rounds/render',
        { clips: renderClips },
        { responseType: 'blob' }
      );

      const downloadUrl = URL.createObjectURL(response.data);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'round.mp3';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      let message = 'Failed to generate MP3.';

      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        const responseText = await error.response.data.text();
        try {
          const parsedError = JSON.parse(responseText);
          message = parsedError.error || message;
        } catch (_parseError) {
          message = responseText || message;
        }
      }

      setGenerateMp3Error(message);
    } finally {
      setIsGeneratingMp3(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="container mx-auto px-4">
        <div className="p-4">
          <h1 className="text-center text-3xl font-bold text-gray-900">Jenny&apos;s Music Trivia Lab</h1>
          <button
            type="button"
            onClick={handleLoadPreviousRounds}
            className="absolute right-4 top-4 rounded px-4 py-2 font-bold text-gray-800 focus:outline-none focus:shadow-outline"
          >
            Load Previous Rounds
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="md:flex-1">
              <InputForm
                addVideo={addVideo}
                updatePreview={updatePreview}
                updatePreviewWithTimestamps={updatePreviewWithTimestamps}
              />
            </div>
            <div className="md:flex-1">
              {selectedVideo ? (
                <YouTubePlayer
                  key={`${selectedVideo.videoId}-${selectedVideo.startTime}-${selectedVideo.endTime}-${previewNonce}`}
                  videoId={selectedVideo.videoId}
                  startTime={selectedVideo.startTime}
                  endTime={selectedVideo.endTime}
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-200 bg-gray-200">
                  <span className="text-sm text-gray-500">No video selected</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <VideoTable
              videos={videos}
              moveRow={moveRow}
              previewVideo={previewVideo}
              removeVideo={removeVideo}
              copyUrl={copyUrl}
              copiedIndex={copiedIndex}
            />

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="text"
                value={roundName}
                onChange={(event) => setRoundName(event.target.value)}
                placeholder="Enter Round Name (optional)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={handleExportRoundJsonClick}
                className="rounded bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700 focus:outline-none focus:shadow-outline"
              >
                Export round JSON
              </button>
              <button
                type="button"
                onClick={handleGenerateMp3Click}
                disabled={isGeneratingMp3}
                className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none focus:shadow-outline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingMp3 ? 'Generating MP3...' : 'Generate MP3'}
              </button>
            </div>
            {generateMp3Error && <p className="mt-2 text-sm text-red-600">{generateMp3Error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
