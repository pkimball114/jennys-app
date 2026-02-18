import React, { useState, useRef } from 'react';
import YouTubePlayer from './YoutubePlayer';
import InputForm from './InputForm';
import VideoTable from './VideoTable';
import axios from 'axios';
import './index.css';
import { downloadJsonFile } from './Utils';

const App = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [roundName, setRoundName] = useState('');

  const extractVideoId = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || '';
    return videoId;
  };

  const addVideo = (video) => {
    const videoId = extractVideoId(video.url);
    // setVideos([...videos, video]);
    setVideos([...videos, { ...video, videoId }]);
  };

  const updateVideos = (newVideos) => {
    setVideos(newVideos);
  };

  const removeVideo = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
    if (selectedVideo === videos[index]) {
      setSelectedVideo(null);  // Deselect if the removed video is currently selected
    }
  };

  const previewVideo = (video) => {
    setSelectedVideo(video);
  };

  const updatePreview = (url) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      setSelectedVideo({ videoId, startTime: 0, endTime: 0 });  // Default to 0 for now
    }
  };

  const updatePreviewWithTimestamps = (url, startTime, endTime) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      setSelectedVideo({ videoId, startTime: startTime, endTime: endTime });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          setRoundName(json.roundName);
          setVideos(json.videos);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Failed to load the file: Invalid JSON format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const fileInputRef = useRef(null);

  const handleLoadPreviousRounds = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        roundName,
        videos
      };

      console.log("Submitting:", JSON.stringify(payload));
      const jsonPayload = JSON.stringify(payload, null, 2);
      const filename = `${roundName || 'Music_Trivia_Round'}.json`;

      downloadJsonFile(jsonPayload, filename);

      const response = await axios.post('https://1qelpkw5bi.execute-api.us-west-2.amazonaws.com/v1/trivia-api', payload);
      console.log('API response:', response.data);
    } catch (error) {
      console.error('Error submitting videos:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="p-4">
          <h1 className="text-center text-3xl font-bold text-gray-900">Jenny's Music Trivia Lab</h1>
          <button
            onClick={handleLoadPreviousRounds}
            className="text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline absolute right-4 top-4"
          >
            Load Previous Rounds
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            style={{ display: 'none' }} // Hide the file input
          />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* InputForm and YouTubePlayer side-by-side */}
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
                  videoId={selectedVideo.videoId}
                  startTime={selectedVideo.startTime}
                  endTime={selectedVideo.endTime}
                  className="w-full h-auto bg-black" // Ensure the player expands to fill the space; adjust as needed
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-sm text-gray-500">No video selected</span>
                </div>
              )}
            </div>
          </div>
          {/* VideoTable beneath InputForm and YouTubePlayer */}
          <div className="mt-6">
            <VideoTable
              videos={videos}
              removeVideo={removeVideo}
              previewVideo={previewVideo}
              updateVideos={updateVideos}
            />
            {videos.length > 0 && (
              <div className="flex items-center mt-4">
                <input
                  type="text"
                  value={roundName}
                  onChange={e => setRoundName(e.target.value)}
                  placeholder="Enter Round Name (optional)"
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  style={{ flexGrow: 1, marginRight: '8px' }}  // Ensure the input field grows and maintains a small margin
                />
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit for Processing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
