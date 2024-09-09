import React, { useState } from 'react';

const InputForm = ({ addVideo, updatePreview }) => {
  const [url, setUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url && startTime && endTime) {
      addVideo({ url, startTime, endTime });
      setUrl('');
      setStartTime('');
      setEndTime('');
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    updatePreview(newUrl);  // Trigger preview update when URL changes
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
      <button type="submit">Add Video</button>
    </form>
  );
};

export default InputForm;
