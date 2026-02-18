import React, { useState, useEffect } from 'react';
import { toMMSS } from './Utils';
import { PencilIcon } from '@heroicons/react/solid';

const VideoTable = ({ videos, removeVideo, previewVideo, updateVideos }) => {
  const [editedVideos, setEditedVideos] = useState([...videos]);
  const [copiedIndex, setCopiedIndex] = useState(null);

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

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index); // Set the index of copied URL
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
<table className="min-w-full leading-normal">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Song Title
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Artist
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Start
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
            End
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
            URL
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {editedVideos.map((video, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="text-center relative">
              <input
                type="text"
                value={video.songTitle}
                onChange={(e) => handleFieldChange(index, 'songTitle', e.target.value)}
                className="text-center w-full"
              />
              <PencilIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100" />
            </td>
            <td className="text-center relative">
              <input
                type="text"
                value={video.artist}
                onChange={(e) => handleFieldChange(index, 'artist', e.target.value)}
                className="text-center w-full"
              />
              <PencilIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100" />
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
              {toMMSS(video.startTime)}
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
              {toMMSS(video.endTime)}
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
              <div className="flex items-center cursor-pointer relative" onClick={() => copyToClipboard(video.url, index)}>
                {video.url}
                {copiedIndex === index && <span className="text-xs text-gray-500 absolute top-5 right-1/2">Copied!</span>}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => moveRow(index, -1)}
                className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full h-8 w-8 inline-flex items-center justify-center"
              >
                ↑
              </button>
              <button
                onClick={() => moveRow(index, 1)}
                className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full h-8 w-8 inline-flex items-center justify-center mx-2"
              >
                ↓
              </button>
              <button
                onClick={() => previewVideo(video)}
                className="text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-lg px-3 py-1"
              >
                Preview
              </button>
              <button
                onClick={() => removeVideo(index)}
                className="text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg px-3 py-1 ml-2"
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VideoTable;
