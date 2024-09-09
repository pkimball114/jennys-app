import React, { useState } from 'react';
import YouTubePlayer from './YouTubePlayer';
import InputForm from './InputForm';
import VideoTable from './VideoTable';
import MultiRangeSlider from "./MultiRangeSlider";
import axios from 'axios';

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

  const removeVideo = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
    if (selectedVideo === videos[index]) {
      setSelectedVideo(null);  // Deselect if the removed video is currently selected
    }
  };

  const handlePreview = (index) => {
    setSelectedVideo(videos[index]);
  };

  const updatePreview = (url) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      setSelectedVideo({ videoId, startTime: 0, endTime: 0 });  // Default to 0 for now
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
    <div>
      <h1>YouTube to Trivia Round MP3</h1>
      <InputForm addVideo={addVideo} updatePreview={updatePreview} />
      {selectedVideo && (
        <YouTubePlayer
          videoId={selectedVideo.videoId}
          startTime={selectedVideo.startTime}
          endTime={selectedVideo.endTime}
        />
      )}
      <MultiRangeSlider
        min={0}
        max={1000}
        onChange={({ min, max }) => console.log(`min = ${min}, max = ${max}`)}
      />
      <VideoTable
        videos={videos}
        removeVideo={removeVideo}
        onPreview={handlePreview}  // Pass the preview handler
      />
      {videos.length > 0 && <button onClick={handleSubmit}>Submit for Processing</button>}
    </div>
  );
};

export default App;
