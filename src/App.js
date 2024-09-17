import React, { useState } from 'react';
import YouTubePlayer from './YoutubePlayer';
import InputForm from './InputForm';
import VideoTable from './VideoTable';
import axios from 'axios';
import './index.css';

const App = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

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

  const handleSubmit = async () => {
    try {
      const response = await axios.post('https://1qelpkw5bi.execute-api.us-west-2.amazonaws.com/v1/trivia-api', { videos });
      console.log('API response:', response.data);
    } catch (error) {
      console.error('Error submitting videos:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-6">Jenny's Music Trivia Lab</h1>
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
              <button 
                onClick={handleSubmit} 
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Submit for Processing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );   
};

export default App;
