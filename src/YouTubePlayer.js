import React from 'react';

function YouTubePlayer({ videoId, startTime, endTime }) {
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?start=${startTime}&end=${endTime}&autoplay=1`;

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-black shadow-sm">
      {videoId ? (
        <iframe
          title="YouTube Video Player"
          className="aspect-video w-full"
          src={youtubeUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <img className="aspect-video w-full object-cover" src="https://placehold.co/560x315" alt="Placeholder" />
      )}
    </div>
  );
}

export default YouTubePlayer;
