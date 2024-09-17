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
    <table className="min-w-full leading-normal">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Song Title
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Artist
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Start Time
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            End Time
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            URL
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {editedVideos.map((video, index) => (
          <tr key={index}>
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
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {video.startTime}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {video.endTime}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {video.url}
                  </p>
                </div>
              </div>
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
