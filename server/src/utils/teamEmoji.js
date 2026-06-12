const MAX_EMOJI_LENGTH = 8;

export function normalizeTeamEmoji(value) {
  if (value === undefined) return undefined;
  if (value === null) return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  return trimmed.slice(0, MAX_EMOJI_LENGTH);
}
