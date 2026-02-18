import React, { useState, useEffect, useRef } from 'react';
import YouTubePlayer from './YouTubePlayer';
import './App.css'; // Import the CSS file
import axios from 'axios';
import openSocket from "socket.io-client";
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaPlay, FaPause } from 'react-icons/fa';

// const socket = openSocket(URL);
const ROUND_STORAGE_KEY = 'musicRound.tableData.v1';

function normalizeYouTubeUrl(input) {
	if (!input) {
		return { videoId: '', normalizedUrl: '' };
	}

	const trimmedInput = input.trim();
	const rawVideoIdPattern = /^[a-zA-Z0-9_-]{11}$/;

	if (rawVideoIdPattern.test(trimmedInput)) {
		return {
			videoId: trimmedInput,
			normalizedUrl: `https://www.youtube.com/watch?v=${trimmedInput}`
		};
	}

	try {
		const parsedUrl = new URL(trimmedInput);
		let parsedVideoId = '';

		if (parsedUrl.hostname === 'youtu.be') {
			parsedVideoId = parsedUrl.pathname.replace('/', '').split('/')[0];
		} else if (
			parsedUrl.hostname === 'youtube.com' ||
			parsedUrl.hostname === 'www.youtube.com' ||
			parsedUrl.hostname === 'm.youtube.com'
		) {
			if (parsedUrl.pathname === '/watch') {
				parsedVideoId = parsedUrl.searchParams.get('v') || '';
			} else if (parsedUrl.pathname.startsWith('/embed/')) {
				parsedVideoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] || '';
			} else if (parsedUrl.pathname.startsWith('/shorts/')) {
				parsedVideoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] || '';
			}
		}

		if (rawVideoIdPattern.test(parsedVideoId)) {
			return {
				videoId: parsedVideoId,
				normalizedUrl: `https://www.youtube.com/watch?v=${parsedVideoId}`
			};
		}
	} catch (_error) {
		// Ignore URL parse errors and fall back to empty result.
	}

	return { videoId: '', normalizedUrl: '' };
}

function normalizeClipRow(rawRow) {
	const row = rawRow || {};
	const parsedFromVideoId = normalizeYouTubeUrl(row.videoId || '');
	const parsedFromUrl = normalizeYouTubeUrl(row.url || '');
	const normalizedVideoId = parsedFromVideoId.videoId || parsedFromUrl.videoId || '';

	return {
		videoId: normalizedVideoId || (typeof row.videoId === 'string' ? row.videoId : ''),
		videoTitle: row.videoTitle ?? '',
		songTitle: row.songTitle ?? '',
		artist: row.artist ?? '',
		startTime: row.startTime ?? '',
		endTime: row.endTime ?? '',
		audioUrl: row.audioUrl ?? null
	};
}

function App() {
	const [videoId, setVideoId] = useState('');
	const [videoTitle, setVideoTitle] = useState('');
	const [songTitle, setSongTitle] = useState('');
	const [artist, setArtist] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [_audioUrl, setAudioUrl] = useState('');
	const [tableData, setTableData] = useState([]);
	const [key, setKey] = useState(0); // Initialize key state
	const [startTimeConverted, setStartTimeConverted] = useState('');
	const [endTimeConverted, setEndTimeConverted] = useState('');
	const [isGeneratingMp3, setIsGeneratingMp3] = useState(false);
	const [generateMp3Error, setGenerateMp3Error] = useState('');
	const [copiedRowIndex, setCopiedRowIndex] = useState(null);
	const fileInputRef = useRef(null);
	const { videoId: parsedVideoId } = normalizeYouTubeUrl(videoId);

	useEffect(() => {
		try {
			const savedRound = localStorage.getItem(ROUND_STORAGE_KEY);
			if (!savedRound) {
				return;
			}

			const parsedRound = JSON.parse(savedRound);
			if (Array.isArray(parsedRound)) {
				const normalizedRound = parsedRound.map((row) => normalizeClipRow(row));
				setTableData(normalizedRound);
			}
		} catch (error) {
			console.error('Error restoring saved round:', error);
		}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(ROUND_STORAGE_KEY, JSON.stringify(tableData));
		} catch (error) {
			console.error('Error saving round:', error);
		}
	}, [tableData]);

	useEffect(() => {
		if (parsedVideoId) {
			const id = parsedVideoId;

			// Fetch video title based on the video ID using the YouTube API
			axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet&key=AIzaSyB7fPei93AWIS4gg0kcx3KeFqVndYCv0es`)
				.then((response) => {
					const title = response.data.items[0]?.snippet?.title;
					setVideoTitle(title || 'Video Title not available');
				})
				.catch((error) => {
					console.error('Error fetching video title:', error);
				});
		} else {
			setVideoTitle('');
		}
	}, [videoId, parsedVideoId]);

	const handleReloadVideoClick = () => {
		// Increment the key to force re-render of YouTubePlayer component
		setKey((prevKey) => prevKey + 1);
	}

	function convertTime(inputTime) {
		if (typeof inputTime === 'number') {
			return inputTime;
		}
		if (!inputTime || typeof inputTime !== 'string') {
			return NaN;
		}

		const trimmed = inputTime.trim();
		if (!trimmed) {
			return NaN;
		}

		if (!trimmed.includes(':')) {
			const parsed = Number(trimmed);
			return Number.isFinite(parsed) ? parsed : NaN;
		}

		const parts = trimmed.split(':').map((part) => Number(part));
		if (parts.some((part) => !Number.isFinite(part))) {
			return NaN;
		}

		return parts.reduce((total, part) => (total * 60) + part, 0);
	}

	const handleStartTimeChange = (event) => {
		const inputTime = event.target.value;
		const convertedTime = convertTime(inputTime);
		setStartTimeConverted(Number.isFinite(convertedTime) ? convertedTime : '');
		setStartTime(inputTime); // Set the original start time
	};

	const handleEndTimeChange = (event) => {
		const inputTime = event.target.value;
		const convertedTime = convertTime(inputTime);
		setEndTimeConverted(Number.isFinite(convertedTime) ? convertedTime : '');
		setEndTime(inputTime); // Set the original start time
	};

	const handleCompleteClick = () => {
		// Ensure the videoId, startTime, and endTime are filled in before proceeding
		if (!videoId || !startTime || !endTime) {
			alert("Please enter a YouTube video URL and specify start and end times.");
			return;
		}

		console.log("handleCompleteClick triggered");

		// Trigger the server to create the audio file based on the videoId and time range
		axios.post('http://localhost:5000/', { url: videoId, startTime, endTime }, { responseType: 'arraybuffer' })
			.then((response) => {
				console.log("handleCompleteClick triggered, axios post");
				const audioBlob = null; //new Blob([response.data], { type: 'audio/m4a' });
				const audioUrl = null; //URL.createObjectURL(audioBlob);

				// Update the state after getting the audio URL
				setAudioUrl(audioUrl);

					// Add a new row
					setTableData((prevData) => [
						...prevData,
						{ videoId, videoTitle, songTitle, artist, startTime, endTime, audioUrl }
					]);

				// // Check if the app is in edit mode or adding a new row
				// if (isEditMode && selectedRowIndex !== null) {
				//   // Update the existing row
				//   setTableData((prevData) =>
				//     prevData.map((row, index) =>
				//       index === selectedRowIndex
				//         ? { videoId, videoTitle, startTime, endTime, audioUrl }  // update the selected row
				//         : row
				//     )
				//   );
				//   setIsEditMode(false);
				// } else {
				//   // Otherwise, add a new row
				//   setTableData((prevData) => [
				//     ...prevData,
				//     { videoId, videoTitle, startTime, endTime, audioUrl }
				//   ]);
				// }

				// Reset form values
					setVideoId('');
					setVideoTitle('');
					setSongTitle('');
					setArtist('');
					setStartTime('');
					setEndTime('');
					setAudioUrl('');
			})
			.catch((error) => {
				console.error('Error triggering audio creation on the server:', error);
			});
	};

	const handleDeleteClick = (index) => {
		// Delete the selected row
		setTableData((prevData) => prevData.filter((row, i) => i !== index));
	};

	const handleMoveUpClick = (index) => {
		// Move the selected row up in the table
		if (index > 0) {
			setTableData((prevData) => {
				const newData = [...prevData];
				[newData[index], newData[index - 1]] = [newData[index - 1], newData[index]];
				return newData;
			});
		}
	};

	const handleMoveDownClick = (index) => {
		// Move the selected row down in the table
		if (index < tableData.length - 1) {
			setTableData((prevData) => {
				const newData = [...prevData];
				[newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
				return newData;
			});
		}
	};

	const loadRowToForm = (selectedRow) => {
		setVideoId(selectedRow.videoId);
		setVideoTitle(selectedRow.videoTitle);
		setSongTitle(selectedRow.songTitle || '');
		setArtist(selectedRow.artist || '');
		setStartTime(selectedRow.startTime);
		setStartTimeConverted(convertTime(selectedRow.startTime));
		setEndTime(selectedRow.endTime);
		setEndTimeConverted(convertTime(selectedRow.endTime));
		setAudioUrl(selectedRow.audioUrl);
	};

	const handlePreviewClick = (index) => {
		const selectedRow = tableData[index];
		loadRowToForm(selectedRow);
	};

	const handlePlayClick = (index) => {
		// Set the form values to the selected row's values
		const selectedRow = tableData[index];
		loadRowToForm(selectedRow);

		// Play the corresponding intro and main audio
		const audioIntro = new Audio(`/number_${index + 1}.mp3`);
		const audioSong = new Audio(selectedRow.audioUrl);

		audioIntro.addEventListener('ended', () => {
			console.log('Intro playback completed');
			audioSong.play();
		});

		// Start playing the intro audio
		audioIntro.play();

		// Function to stop both audios
		const stopAudio = () => {
			audioIntro.pause();
			audioSong.pause();
			audioIntro.currentTime = 0;
			audioSong.currentTime = 0;
		};

		// Add an event listener to stop the audio on click
		const handleDocumentClick = () => {
			stopAudio();
			// Remove event listener after click
			document.removeEventListener('click', handleDocumentClick);
		};

		document.addEventListener('click', handleDocumentClick);
	};

	const handleCopyUrlClick = async (index) => {
		const selectedRow = tableData[index];
		const normalized = normalizeYouTubeUrl(selectedRow.videoId);
		const urlToCopy = normalized.normalizedUrl || selectedRow.videoId || '';

		if (!urlToCopy) {
			return;
		}

		try {
			await navigator.clipboard.writeText(urlToCopy);
			setCopiedRowIndex(index);
			setTimeout(() => {
				setCopiedRowIndex((current) => (current === index ? null : current));
			}, 2000);
		} catch (error) {
			console.error('Failed to copy URL:', error);
		}
	};

	const handleClearRoundClick = () => {
		const shouldClear = window.confirm('Clear all clips from this round?');
		if (!shouldClear) {
			return;
		}

		setTableData([]);
	};

	const handleExportRoundJsonClick = () => {
		const roundPayload = {
			exportedAt: new Date().toISOString(),
			clips: tableData
		};
		const jsonBlob = new Blob([JSON.stringify(roundPayload, null, 2)], { type: 'application/json' });
		const objectUrl = URL.createObjectURL(jsonBlob);
		const downloadLink = document.createElement('a');
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

		downloadLink.href = objectUrl;
		downloadLink.download = `music-round-${timestamp}.json`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
		URL.revokeObjectURL(objectUrl);
	};

	const handleLoadPreviousRounds = () => {
		fileInputRef.current?.click();
	};

	const handleFileUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			const fileContents = await file.text();
			const parsedJson = JSON.parse(fileContents);
			const importedRows = Array.isArray(parsedJson)
				? parsedJson
				: Array.isArray(parsedJson?.clips)
					? parsedJson.clips
					: Array.isArray(parsedJson?.videos)
						? parsedJson.videos
						: null;

			if (!importedRows) {
				throw new Error('JSON does not contain a valid clips or videos array.');
			}

			const normalizedRows = importedRows.map((row) => normalizeClipRow(row));
			setTableData(normalizedRows);
		} catch (error) {
			console.error('Error importing round JSON:', error);
			alert('Failed to load the file: Invalid or unsupported JSON format.');
		} finally {
			event.target.value = '';
		}
	};

	const handleGenerateMp3Click = async () => {
		setGenerateMp3Error('');
		if (tableData.length === 0) {
			setGenerateMp3Error('Add at least one clip before generating MP3.');
			return;
		}

		const renderClips = [];
		for (let i = 0; i < tableData.length; i += 1) {
			const clip = tableData[i];
			const normalizedClip = normalizeYouTubeUrl(clip.videoId);
			const startSeconds = convertTime(clip.startTime);
			const endSeconds = convertTime(clip.endTime);
			const clipUrl = normalizedClip.normalizedUrl || (clip.videoId || '').trim();

			if (!clipUrl) {
				setGenerateMp3Error(`Clip ${i + 1} has an invalid YouTube URL/ID.`);
				return;
			}

			if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds) || endSeconds <= startSeconds) {
				setGenerateMp3Error(`Clip ${i + 1} has invalid start/end time.`);
				return;
			}

			renderClips.push({
				url: clipUrl,
				startSeconds,
				endSeconds
			});
		}

		setIsGeneratingMp3(true);
		try {
			const response = await axios.post(
				'http://localhost:5000/api/rounds/render',
				{ clips: renderClips },
				{ responseType: 'blob' }
			);

			const downloadUrl = URL.createObjectURL(response.data);
			const downloadLink = document.createElement('a');
			downloadLink.href = downloadUrl;
			downloadLink.download = 'round.mp3';
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			let message = 'Failed to generate MP3.';

			if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
				const responseText = await error.response.data.text();
				try {
					const parsedError = JSON.parse(responseText);
					message = parsedError.error || message;
				} catch (_parseError) {
					message = responseText || message;
				}
			}

			setGenerateMp3Error(message);
		} finally {
			setIsGeneratingMp3(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 py-8">
			<div className="container mx-auto max-w-6xl px-4">
				<div className="rounded-lg bg-white p-6 shadow-md">
					<div className="mb-6 flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">Music Round Builder</h1>
						<button
							className="rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
							onClick={handleLoadPreviousRounds}
						>
							Load Previous Rounds
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept=".json,application/json"
							onChange={handleFileUpload}
							className="hidden"
						/>
					</div>
						<div className="space-y-4">
							<input
								className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
								type="text"
								placeholder="Enter YouTube Video URL or ID"
								value={videoId}
								onChange={(e) => setVideoId(e.target.value)}
							/>
						<YouTubePlayer
							videoId={parsedVideoId}
							startTime={startTimeConverted.toString()}
							endTime={endTimeConverted.toString()}
							key={key}
						/>
							<input
								className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
								type="text"
								placeholder="Video Title"
								value={videoTitle}
								onChange={(e) => setVideoTitle(e.target.value)}
							/>
							<div className="grid gap-4 md:grid-cols-2">
								<input
									className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
									type="text"
									placeholder="Song Title (optional)"
									value={songTitle}
									onChange={(e) => setSongTitle(e.target.value)}
								/>
								<input
									className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
									type="text"
									placeholder="Artist (optional)"
									value={artist}
									onChange={(e) => setArtist(e.target.value)}
								/>
							</div>
						<div className="grid gap-4 md:grid-cols-3">
							<label className="text-sm font-medium text-gray-700">
								Start Time:
									<input
										className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
										type="text"
										placeholder="0:00"
										value={startTime}
										onChange={handleStartTimeChange}
								/>
								<input
									type="hidden"
									value={startTimeConverted}
								/>
							</label>
							<label className="text-sm font-medium text-gray-700">
								End Time:
									<input
										className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
										type="text"
										placeholder="0:00"
										value={endTime}
										onChange={handleEndTimeChange}
								/>
								<input
									type="hidden"
									value={endTimeConverted}
								/>
							</label>
								<div className="flex items-end">
									<button
										className="w-full rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
										onClick={handleReloadVideoClick}
									>
										Reload Video
									</button>
							</div>
						</div>
							<div className="flex flex-wrap gap-2">
								<button
									className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
									onClick={handleCompleteClick}
								>
									Complete
								</button>
								<button
									className="rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
									onClick={handleClearRoundClick}
								>
									Clear round
								</button>
								<button
									className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
									onClick={handleExportRoundJsonClick}
								>
									Export round JSON
								</button>
								<button
									className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:cursor-not-allowed disabled:opacity-60"
									onClick={handleGenerateMp3Click}
									disabled={isGeneratingMp3}
								>
									{isGeneratingMp3 ? 'Generating MP3...' : 'Generate MP3'}
							</button>
						</div>
						{generateMp3Error && <p className="text-sm text-red-600">{generateMp3Error}</p>}
							<EditableTable
								data={tableData}
								onDelete={handleDeleteClick}
								onMoveUp={handleMoveUpClick}
								onMoveDown={handleMoveDownClick}
								onPreview={handlePreviewClick}
								onPlay={handlePlayClick}
								onCopyUrl={handleCopyUrlClick}
								copiedRowIndex={copiedRowIndex}
								showVideoId={false}
							/>
						</div>
				</div>
			</div>
		</div>
	);
}

// Table component
const EditableTable = ({
	data,
	onDelete,
	onMoveUp,
	onMoveDown,
	onPreview,
	onPlay,
	onCopyUrl,
	copiedRowIndex,
	showVideoId
}) => {
	return (
		<div className="overflow-x-auto rounded-md border border-gray-200">
			<table className="min-w-full border-collapse">
				<thead className="bg-gray-50">
					<tr>
						<th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"></th>
						{showVideoId && <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Video ID</th>}
							<th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Video Title</th>
							<th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Song Title</th>
							<th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Artist</th>
							<th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Start Time</th>
							<th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">End Time</th>
							<th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Audio URL</th>
						<th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Action</th>
					</tr>
				</thead>
					<tbody className="divide-y divide-gray-200 bg-white">
						{data.map((row, index) => (
							<tr key={index} className="hover:bg-gray-50">
								<td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">{index + 1}</td>
								{showVideoId && <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">{row.videoId}</td>}
								<td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">{row.videoTitle}</td>
								<td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">{row.songTitle || ''}</td>
								<td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">{row.artist || ''}</td>
								<td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">{row.startTime}</td>
								<td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">{row.endTime}</td>
								<td className="max-w-xs truncate border border-gray-200 px-3 py-2 text-sm text-gray-700">{row.audioUrl}</td>
								<td className="border border-gray-200 px-3 py-2">
									<div className="flex gap-2">
										<button className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300" onClick={() => onPreview(index)}>Preview</button>
										<button className="rounded-md bg-slate-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300" onClick={() => onCopyUrl(index)}>
											{copiedRowIndex === index ? 'Copied!' : 'Copy URL'}
										</button>
										<button className="rounded-md bg-green-500 px-2 py-1 text-white transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300" onClick={() => onPlay(index)}><FaPlay /></button>
										<button className="rounded-md bg-blue-500 px-2 py-1 text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300" onClick={() => onMoveUp(index)}><FaArrowUp /></button>
										<button className="rounded-md bg-blue-500 px-2 py-1 text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300" onClick={() => onMoveDown(index)}><FaArrowDown /></button>
										<button className="rounded-md bg-red-500 px-2 py-1 text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300" onClick={() => onDelete(index)}><FaTrash /></button>
									</div>
								{/* <button onClick={() => onPause(index)}><FaPause /></button> */}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default App;
