import React from 'react';

function YouTubePlayer({ videoId, startTime, endTime }) {
  // Ensure that both start and end times are included as query params
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?start=${startTime}&end=${endTime}&autoplay=1`;

  return (
    <div className="youtube-player">
      {videoId ? (
        <iframe
          title="YouTube Video Player"
          width="560"
          height="315"
          src={youtubeUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <img src="https://placehold.co/560x315" alt="Placeholder" />
      )}
    </div>
  );
}

export default YouTubePlayer;
