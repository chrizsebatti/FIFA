export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getMatchStatus(match) {
  if (match.status === 'finished') return 'finished';
  if (match.isLocked) return 'locked';
  const hoursUntil = (new Date(match.startTime) - new Date()) / (1000 * 60 * 60);
  if (hoursUntil <= 2 && hoursUntil > 0) return 'soon';
  return 'open';
}

export function statusLabel(status) {
  switch (status) {
    case 'open':
      return { text: 'Open', className: 'bg-green-600' };
    case 'soon':
      return { text: 'Starting Soon', className: 'bg-amber-500 text-black' };
    case 'locked':
      return { text: 'Locked', className: 'bg-red-600' };
    case 'finished':
      return { text: 'Finished', className: 'bg-gray-600' };
    default:
      return { text: 'Unknown', className: 'bg-gray-600' };
  }
}
