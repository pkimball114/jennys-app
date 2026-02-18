import React from 'react';

function YouTubePlayer({ videoId, startTime, endTime }) {
  const start = startTime;
  const end = endTime;
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}`;

  return (
    <div className="youtube-player">
      {videoId ? (
        <iframe
          key={videoId}  // Add the key as part of the iframe to force re-render
          title="YouTube Video Player"
          width="560"
          height="315"
          src={youtubeUrl}
          allowFullScreen
        ></iframe>
      ) : (
        <img src="https://placehold.co/560x315" alt="Placeholder" />
      )}
    </div>
  );
}

export default YouTubePlayer;
