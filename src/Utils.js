export const toSeconds = (timeString) => {
    const [mins, secs] = timeString.split(':').map(Number);
    if (isNaN(mins) || isNaN(secs) || mins < 0 || secs < 0 || secs >= 60) {
      throw new Error("Invalid time format");
    }
    return (mins * 60) + secs;
};
  
export const toMMSS = (seconds) => {
    if (seconds < 0) {
        throw new Error("Negative seconds not allowed");
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper to format the time input as mm:ss dynamically
export const formatTimeInput = (value) => {
    // Remove non-numeric characters and restrict length to 4 digits
    const numeric = value.replace(/[^\d]/g, '').slice(0, 4);
  
    // Split into minutes and seconds based on length
    if (numeric.length <= 2) {
      return numeric; // Only seconds available
    } else {
      return `${numeric.slice(0, -2)}:${numeric.slice(-2)}`; // Include colon for mm:ss format
    }
};
  
// Helper to ensure time format is valid on blur
export const fixTimeFormat = (value) => {
    let [minutes, seconds] = value.split(':').map(Number);
    minutes = isNaN(minutes) ? 0 : minutes;
    seconds = isNaN(seconds) ? 0 : seconds;
    if (seconds > 59) seconds = 59; // Ensure seconds don't exceed 59
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};