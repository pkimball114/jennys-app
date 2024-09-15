import React, { useState, useEffect } from 'react';

const VideoTable = ({ videos, removeVideo, previewVideo, updateVideos }) => {
  const [editedVideos, setEditedVideos] = useState([...videos]);

  useEffect(() => {
    setEditedVideos([...videos]); // Update local state when the videos prop changes
  }, [videos]);

  const handleFieldChange = (index, field, value) => {
    const newVideos = [...editedVideos];
    newVideos[index][field] = value;
    setEditedVideos(newVideos);
  };

  const moveRow = (index, direction) => {
    const newPosition = index + direction;
    if (newPosition < 0 || newPosition >= editedVideos.length) return;
    const newVideos = [...editedVideos];
    const [removed] = newVideos.splice(index, 1);
    newVideos.splice(newPosition, 0, removed);
    setEditedVideos(newVideos);
    updateVideos(newVideos); // Notify parent component of the change
  };

  return (
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Song Title</th>
          <th>Artist</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {editedVideos.map((video, index) => (
          <tr key={index}>
            <td>{video.url}</td>
            <td>{video.startTime}</td>
            <td>{video.endTime}</td>
            <td>
              <input
                type="text"
                value={video.songTitle}
                onChange={(e) => handleFieldChange(index, 'songTitle', e.target.value)}
              />
            </td>
            <td>
              <input
                type="text"
                value={video.artist}
                onChange={(e) => handleFieldChange(index, 'artist', e.target.value)}
              />
            </td>
            <td>
              <button onClick={() => moveRow(index, -1)}>&uarr;</button>
              <button onClick={() => moveRow(index, 1)}>&darr;</button>
              <button onClick={() => previewVideo(video)}>&#x21bb;</button>
              <button onClick={() => removeVideo(index)}>x</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VideoTable;
