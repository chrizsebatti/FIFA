export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

// datetime-local value has no timezone — convert using browser's local time
export function localDatetimeToISO(datetimeLocal) {
  if (!datetimeLocal) return '';
  return new Date(datetimeLocal).toISOString();
}

export function isoToDatetimeLocal(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getMatchStatus(match) {
  if (match.status === 'finished') return 'finished';
  if (new Date() >= new Date(match.startTime)) return 'started';
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
    case 'started':
      return { text: 'Game Started', className: 'bg-red-600' };
    case 'finished':
      return { text: 'Finished', className: 'bg-gray-600' };
    default:
      return { text: 'Unknown', className: 'bg-gray-600' };
  }
}
