# React YouTube App Architecture

## 1) High-level user flow

The app is currently a single-screen workflow (`src/App.js`):

1. User enters a YouTube URL or ID in a text input.
2. App attempts to fetch video title from YouTube Data API and auto-fills title.
3. App shows an embedded YouTube player preview (`src/YouTubePlayer.js`) using start/end query params.
4. User enters `Start Time` and `End Time` as `mm:ss`.
5. User clicks `Reload Video` to force iframe refresh for updated time bounds.
6. User clicks `Complete`:
   - Frontend POSTs `{ url, startTime, endTime }` to `http://localhost:5000/`.
   - A table row is appended with clip metadata.
7. User can manage rows in table:
   - delete row
   - move row up/down (ordering)
   - click play (plays local numbered intro MP3, then attempts clip audio)

There are no separate routes/pages; this is one React view.

## 2) Codebase map

- `src/App.js`
  - Main UI and almost all app logic/state.
  - Handles input fields, title lookup, time conversion, table CRUD/reordering, and play action.
- `src/YouTubePlayer.js`
  - Stateless iframe component for YouTube embed URL construction.
- `src/index.js`
  - React bootstrap/mount.
- `server.js`
  - Express backend endpoint (`POST /`) that streams audio from YouTube via `ytdl-core`.
- `public/number_1.mp3` ... `public/number_15.mp3`
  - Local intro audio files used before clip playback on table Play.
- `package.json`
  - CRA frontend scripts and backend deps (`express`, `ytdl-core`, `cors`).
- `README.md`
  - Default Create React App README only.

## 3) YouTube URL handling today

### Input mode: search vs direct URL

- No YouTube search flow exists.
- Only direct text input exists, intended for full watch URL or raw ID.

### Parsing behavior

- Parsing is string replacement only:
  - `videoId.replace("https://www.youtube.com/watch?v=", "")`
- This is used in both:
  - title lookup API request
  - embed URL generation
- Consequences:
  - Works for exact `https://www.youtube.com/watch?v=...` format.
  - Does not robustly handle `youtu.be/...`, mobile URLs, extra params (`&t=`, playlists), or validation.

### Embedding and timestamps

- Embed URL format:
  - `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}`
- Start/end values come from manual `mm:ss` inputs converted to seconds.
- No parsing of timestamps from pasted YouTube URL.
- No snippet extraction:
  - Only metadata usage is title from `videos?part=snippet`.
  - Clip extraction is not applied server-side (see below).

## 4) “Music round” state model and persistence

### State location

All round state is in React local component state in `src/App.js`:

- `tableData: Array<ClipRow>` where each row is:
  - `{ videoId, videoTitle, startTime, endTime, audioUrl }`
- Ordering = array order.
- Reordering uses in-place swap on copied array (`move up/down` handlers).

### Persistence

- No persistence layer exists:
  - no `localStorage`
  - no DB
  - no backend save/load endpoints
- State resets on page refresh.

### Playback coupling

- `onPlay(index)` reads selected row, sets form state from it, then plays:
  - local intro `/number_${index+1}.mp3`
  - followed by `new Audio(selectedRow.audioUrl)`
- Current `audioUrl` is always `null` when rows are created, so clip playback is effectively not wired.

## 5) Audio/video export status

### What exists

- Backend `POST /` calls `ytdl(videoURL, { filter: "audioonly" })` and pipes stream to HTTP response.
- This is a raw stream pass-through from YouTube source audio.

### What does not exist

- No server-side trimming by `startTime`/`endTime` (values are ignored in `server.js`).
- No explicit MP3 conversion/transcoding pipeline (e.g., ffmpeg).
- No saved output files or job storage.
- No response headers for attachment download naming/type strategy.
- No frontend download action wired to a Blob URL.
- No video export flow at all.

## 6) Gaps vs target goal (downloadable MP3 or video)

1. Robust URL normalization/validation is missing.
2. Clip-range extraction is missing in backend (currently full audio stream).
3. Encoding/output format selection is missing:
   - MP3 generation requires transcoding.
   - Video export path does not exist.
4. Artifact lifecycle is missing:
   - create file/blob
   - expose download URL or direct attachment response
   - retain/cleanup strategy
5. Frontend data model is incomplete:
   - `audioUrl` never populated from backend output.
   - no status/error/progress per clip.
6. Persistence is missing for round composition/order.
7. Security/ops hardening is missing:
   - API key hard-coded in client.
   - no rate limiting, auth, or abuse controls around media download endpoint.

