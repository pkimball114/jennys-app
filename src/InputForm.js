import React, { useState } from 'react';

const InputForm = ({ addVideo, updatePreview, updatePreviewWithTimestamps }) => {
  const [url, setUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url && startTime && endTime && songTitle && artist) {
      addVideo({ url, startTime, endTime, songTitle, artist });
      setUrl('');
      setStartTime('');
      setEndTime('');
      setSongTitle('');
      setArtist('');
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    updatePreview(newUrl);  // Trigger preview update when URL changes
  };

  // Refresh the video (reset times and update preview with timestamps)
  const handleRefreshVideo = () => {
    if (url) {
      updatePreviewWithTimestamps(url, startTime, endTime);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">YouTube URL:</label>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter YouTube URL"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label>Start Time (seconds):</label>
        <input
          type="number"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Start time"
          required
        />
      </div>
      <div>
        <label>End Time (seconds):</label>
        <input
          type="number"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="End time"
          required
        />
      </div>
      <div>
        <label>Song Title:</label>
        <input
          type="text"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          placeholder="Song Title"
          required
        />
      </div>
      <div>
        <label>Artist:</label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist"
          required
        />
      </div>
      <button type="submit">Add Video</button>
      <button type="button" onClick={handleRefreshVideo} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Refresh Video
      </button>
    </form>
  );
};

export default InputForm;
