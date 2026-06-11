export function isLocked(match) {
  return new Date() >= new Date(match.startTime) || match.status === 'finished';
}
