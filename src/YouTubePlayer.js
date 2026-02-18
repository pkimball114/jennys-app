import React from 'react';

function YouTubePlayer({ videoId, startTime, endTime }) {
  const start = startTime;
  const end = endTime;
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}`;

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-black shadow-sm">
      {videoId ? (
        <iframe
          key={videoId}  // Add the key as part of the iframe to force re-render
          title="YouTube Video Player"
          className="aspect-video w-full"
          src={youtubeUrl}
          allowFullScreen
        ></iframe>
      ) : (
        <img className="aspect-video w-full object-cover" src="https://placehold.co/560x315" alt="Placeholder" />
      )}
    </div>
  );
}

export default YouTubePlayer;
