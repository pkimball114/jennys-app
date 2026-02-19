export const toSeconds = (input) => {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : NaN;
  }

  if (typeof input !== 'string') {
    return NaN;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return NaN;
  }

  if (!trimmed.includes(':')) {
    const asNumber = Number(trimmed);
    return Number.isFinite(asNumber) ? asNumber : NaN;
  }

  const parts = trimmed.split(':').map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) {
    return NaN;
  }

  return parts.reduce((total, part) => (total * 60) + part, 0);
};

export const toMMSS = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeInput = (value) => {
  const numeric = String(value || '').replace(/[^\d]/g, '').slice(0, 4);
  if (numeric.length <= 2) {
    return numeric;
  }
  return `${numeric.slice(0, -2)}:${numeric.slice(-2)}`;
};

export const fixTimeFormat = (value) => {
  let [minutes, seconds] = String(value || '').split(':').map(Number);
  minutes = Number.isFinite(minutes) ? minutes : 0;
  seconds = Number.isFinite(seconds) ? seconds : 0;

  if (seconds > 59) {
    seconds = 59;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const downloadJsonFile = (jsonString, filename) => {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
