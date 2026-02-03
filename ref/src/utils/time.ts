export function formatTime(waitTime: number) {
  const hours = Math.floor(waitTime / (1000 * 60 * 60));
  const minutes = Math.floor((waitTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((waitTime % (1000 * 60)) / 1000);
  return `${hours}:${minutes}:${seconds}`;
}

export const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};
