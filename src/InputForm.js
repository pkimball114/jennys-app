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
    <form onSubmit={handleSubmit}>
      <div>
        <label>YouTube URL:</label>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter YouTube URL"
          required
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
      <button type="button" onClick={handleRefreshVideo} style={{ marginLeft: '10px' }}>
        Refresh Video
      </button>
    </form>
  );
};

export default InputForm;
