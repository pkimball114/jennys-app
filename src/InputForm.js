import React, { useState } from 'react';
import { toSeconds, formatTimeInput, fixTimeFormat } from './Utils'; 

const InputForm = ({ addVideo, updatePreview, updatePreviewWithTimestamps }) => {
  const [url, setUrl] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [startTimeFormatted, setStartTimeFormatted] = useState('00:00');
  const [endTimeFormatted, setEndTimeFormatted] = useState('00:00');
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');

  // Handle changes to the formatted time inputs
  const handleTimeChange = (value, setFormattedTime, setActualTime) => {
    const formattedTime = formatTimeInput(value);
    setFormattedTime(formattedTime);
    try {
      const seconds = toSeconds(formattedTime);
      setActualTime(seconds);
    } catch (error) {
      console.error(error);  // Handle or display this error appropriately
    }
  };

  const handleTimeBlur = (setFormattedTime) => {
    setFormattedTime(current => {
      const fixed = fixTimeFormat(current);
      setFormattedTime(fixed);
      return fixed;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url && startTimeFormatted && endTimeFormatted && songTitle && artist) {
      addVideo({ url, startTime, endTime, songTitle, artist });
      setUrl('');
      setStartTimeFormatted('00:00');
      setEndTimeFormatted('00:00');
      setStartTime(0);
      setEndTime(0);
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
          <label className="block text-gray-700 text-sm font-bold mb-2">Start Time:</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={startTimeFormatted}
            onChange={(e) => handleTimeChange(e.target.value, setStartTimeFormatted, setStartTime)}
            onBlur={() => handleTimeBlur(setStartTimeFormatted)}
            placeholder="00:00"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-bold mb-2">End Time:</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={endTimeFormatted}
            onChange={(e) => handleTimeChange(e.target.value, setEndTimeFormatted, setEndTime)}
            onBlur={() => handleTimeBlur(setEndTimeFormatted)}
            placeholder="00:00"
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
