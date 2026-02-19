import React from 'react';
import { toMMSS } from './Utils';

function VideoTable({ videos, moveRow, previewVideo, removeVideo, copyUrl, copiedIndex }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal">
        <thead className="bg-gray-50">
          <tr>
            <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
              Song Title
            </th>
            <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
              Artist
            </th>
            <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
              Start
            </th>
            <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
              End
            </th>
            <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
              URL
            </th>
            <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {videos.map((video, index) => (
            <tr key={`${video.videoId || video.url}-${index}`} className="hover:bg-gray-50">
              <td className="px-5 py-5 text-center text-sm text-gray-800">{video.songTitle || ''}</td>
              <td className="px-5 py-5 text-center text-sm text-gray-800">{video.artist || ''}</td>
              <td className="px-5 py-5 text-center text-sm text-gray-800">{toMMSS(video.startTime)}</td>
              <td className="px-5 py-5 text-center text-sm text-gray-800">{toMMSS(video.endTime)}</td>
              <td className="px-5 py-5 text-center text-sm text-gray-800">
                <button
                  type="button"
                  className="max-w-xs truncate text-blue-600 hover:text-blue-800"
                  onClick={() => copyUrl(index)}
                  title={video.url}
                >
                  {video.url}
                </button>
                {copiedIndex === index && <span className="ml-2 text-xs text-gray-500">Copied!</span>}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <button
                  type="button"
                  onClick={() => moveRow(index, -1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveRow(index, 1)}
                  className="mx-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => previewVideo(video)}
                  className="rounded-lg bg-green-500 px-3 py-1 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="ml-2 rounded-lg bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VideoTable;
