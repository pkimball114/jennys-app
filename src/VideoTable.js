import React from 'react';

const VideoTable = ({ videos, removeVideo, updateVideo }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>YouTube URL</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {videos.map((video, index) => (
          <tr key={index}>
            <td>{video.url}</td>
            <td>{video.startTime}</td>
            <td>{video.endTime}</td>
            <td>
              <button onClick={() => removeVideo(index)}>Delete</button>
              {/* Add editing functionality here if needed */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VideoTable;
