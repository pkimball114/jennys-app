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
  const handleRefreshVideo = (e) => {
    e.preventDefault();
    if (url) {
      updatePreviewWithTimestamps(url, startTime, endTime);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">YouTube URL:</label>
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter YouTube URL"
          required
        />
      </div>
      {/* Start Time and End Time side-by-side */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-bold mb-2">Start Time (seconds):</label>
          <input
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start time"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-bold mb-2">End Time (seconds):</label>
          <input
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End time"
            required
          />
        </div>
      </div>
      {/* Song Title and Artist side-by-side */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-bold mb-2">Song Title:</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="Song Title"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-bold mb-2">Artist:</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist"
            required
          />
        </div>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Video
        </button>
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleRefreshVideo} // Define this function as needed
        >
          Refresh Video
        </button>
      </div>
    </form>
  );
};

export default InputForm;
