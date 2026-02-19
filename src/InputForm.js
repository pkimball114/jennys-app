import React, { useState } from 'react';
import { toSeconds, formatTimeInput, fixTimeFormat } from './Utils';

function InputForm({ addVideo, updatePreview, updatePreviewWithTimestamps }) {
  const [url, setUrl] = useState('');
  const [startTimeFormatted, setStartTimeFormatted] = useState('00:00');
  const [endTimeFormatted, setEndTimeFormatted] = useState('00:00');
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleTimeChange = (value, setFormattedTime) => {
    const formatted = formatTimeInput(value);
    setFormattedTime(formatted);
  };

  const handleTimeBlur = (setFormattedTime) => {
    setFormattedTime((current) => fixTimeFormat(current));
  };

  const handleAddVideo = (event) => {
    event.preventDefault();

    const startSeconds = toSeconds(startTimeFormatted);
    const endSeconds = toSeconds(endTimeFormatted);

    if (!url.trim()) {
      alert('Please enter a YouTube URL or ID.');
      return;
    }

    if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds) || endSeconds <= startSeconds) {
      alert('Please enter valid start and end times. End time must be greater than start time.');
      return;
    }

    addVideo({
      url: url.trim(),
      startTime: startSeconds,
      endTime: endSeconds,
      songTitle: songTitle.trim(),
      artist: artist.trim()
    });

    setUrl('');
    setStartTimeFormatted('00:00');
    setEndTimeFormatted('00:00');
    setSongTitle('');
    setArtist('');
  };

  const handleRefreshVideo = (event) => {
    event.preventDefault();

    const startSeconds = toSeconds(startTimeFormatted);
    const endSeconds = toSeconds(endTimeFormatted);

    if (!url.trim()) {
      return;
    }

    updatePreviewWithTimestamps(
      url.trim(),
      Number.isFinite(startSeconds) ? startSeconds : 0,
      Number.isFinite(endSeconds) ? endSeconds : 0
    );
  };

  const handleUrlChange = (event) => {
    const nextUrl = event.target.value;
    setUrl(nextUrl);
    updatePreview(nextUrl);
  };

  return (
    <form onSubmit={handleAddVideo} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-bold text-gray-700">YouTube URL:</label>
        <input
          type="text"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter YouTube URL"
          required
        />
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-bold text-gray-700">Start Time:</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={startTimeFormatted}
            onChange={(event) => handleTimeChange(event.target.value, setStartTimeFormatted)}
            onBlur={() => handleTimeBlur(setStartTimeFormatted)}
            placeholder="00:00"
            required
          />
        </div>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-bold text-gray-700">End Time:</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={endTimeFormatted}
            onChange={(event) => handleTimeChange(event.target.value, setEndTimeFormatted)}
            onBlur={() => handleTimeBlur(setEndTimeFormatted)}
            placeholder="00:00"
            required
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-bold text-gray-700">Song Title:</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={songTitle}
            onChange={(event) => setSongTitle(event.target.value)}
            placeholder="Song Title (optional)"
          />
        </div>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-bold text-gray-700">Artist:</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            placeholder="Artist (optional)"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center space-x-4">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline"
        >
          Add Video
        </button>
        <button
          type="button"
          className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none focus:shadow-outline"
          onClick={handleRefreshVideo}
        >
          Refresh Video
        </button>
      </div>
    </form>
  );
}

export default InputForm;
