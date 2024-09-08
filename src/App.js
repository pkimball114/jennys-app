import React, { useState } from 'react';
import InputForm from './InputForm';
import VideoTable from './VideoTable';
import axios from 'axios';

const App = () => {
  const [videos, setVideos] = useState([]);

  const addVideo = (video) => {
    setVideos([...videos, video]);
  };

  const removeVideo = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
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
      <InputForm addVideo={addVideo} />
      <VideoTable videos={videos} removeVideo={removeVideo} />
      {videos.length > 0 && <button onClick={handleSubmit}>Submit for Processing</button>}
    </div>
  );
};

export default App;
