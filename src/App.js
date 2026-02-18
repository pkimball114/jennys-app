import React, { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import './App.css'; // Import the CSS file
import axios from 'axios';
import openSocket from "socket.io-client";
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaPlay, FaPause } from 'react-icons/fa';

// const socket = openSocket(URL);

function App() {
	const [videoId, setVideoId] = useState('');
	const [videoTitle, setVideoTitle] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [_audioUrl, setAudioUrl] = useState('');
	const [tableData, setTableData] = useState([]);
	const [key, setKey] = useState(0); // Initialize key state
	const [startTimeConverted, setStartTimeConverted] = useState('');
	const [endTimeConverted, setEndTimeConverted] = useState('');

	useEffect(() => {
		if (videoId) {
			const id = videoId.replace("https://www.youtube.com/watch?v=", "");

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
	}, [videoId]);

	const handleReloadVideoClick = () => {
		// Increment the key to force re-render of YouTubePlayer component
		setKey((prevKey) => prevKey + 1);
	}

	function convertTime(inputTime) {
		const [minutes, seconds] = inputTime.split(":");
		const convertedTime = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
		return convertedTime;
	}

	const handleStartTimeChange = (event) => {
		const inputTime = event.target.value;
		const convertedTime = convertTime(inputTime);
		setStartTimeConverted(convertedTime);
		setStartTime(inputTime); // Set the original start time
	};

	const handleEndTimeChange = (event) => {
		const inputTime = event.target.value;
		const convertedTime = convertTime(inputTime);
		setEndTimeConverted(convertedTime);
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
					{ videoId, videoTitle, startTime, endTime, audioUrl }
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

	const handlePlayClick = (index) => {
		// Set the form values to the selected row's values
		const selectedRow = tableData[index];
		setVideoId(selectedRow.videoId);
		setVideoTitle(selectedRow.videoTitle);
		setStartTime(selectedRow.startTime);
		setStartTimeConverted(convertTime(selectedRow.startTime));
		setEndTime(selectedRow.endTime);
		setEndTimeConverted(convertTime(selectedRow.endTime));
		setAudioUrl(selectedRow.audioUrl);

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

	return (
		<div className="app-container">
			<div className="app">
				<input
					type="text"
					placeholder="Enter YouTube Video URL or ID"
					value={videoId}
					onChange={(e) => setVideoId(e.target.value)}
				/>
				<YouTubePlayer
					videoId={videoId.replace("https://www.youtube.com/watch?v=", "")}
					startTime={startTimeConverted.toString()}
					endTime={endTimeConverted.toString()}
					key={key} />
				<input
					type="text"
					placeholder="Video Title"
					value={videoTitle}
					onChange={(e) => setVideoTitle(e.target.value)}
				/>
				<div className="time-inputs">
					<label>
						Start Time:
						<input
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
					<label>
						End Time:
						<input
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
					<button onClick={handleReloadVideoClick}>Reload Video</button>
				</div>
				<button onClick={handleCompleteClick}>Complete</button>
				<EditableTable
					data={tableData}
					onDelete={handleDeleteClick}
					onMoveUp={handleMoveUpClick}
					onMoveDown={handleMoveDownClick}
					onPlay={handlePlayClick}
					showVideoId={false}  // Set to true if you want to display the videoId column
				/>
			</div>
		</div>
	);
}

// Table component
const EditableTable = ({ data, onDelete, onMoveUp, onMoveDown, onPlay, showVideoId }) => {
	return (
		<div>
			<table>
				<thead>
					<tr>
						<th></th>
						{showVideoId && <th>Video ID</th>}
						<th>Video Title</th>
						<th>Start Time</th>
						<th>End Time</th>
						<th>Audio URL</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{data.map((row, index) => (
						<tr key={index}>
							<td>{index + 1}</td> {/* Display row number */}
							{showVideoId && <td>{row.videoId}</td>}
							<td>{row.videoTitle}</td>
							<td>{row.startTime}</td>
							<td>{row.endTime}</td>
							<td>{row.audioUrl}</td>
							<td>
								<button onClick={() => onDelete(index)}><FaTrash /></button>
								<button onClick={() => onMoveUp(index)}><FaArrowUp /></button>
								<button onClick={() => onMoveDown(index)}><FaArrowDown /></button>
								<button onClick={() => onPlay(index)}><FaPlay /></button>
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
