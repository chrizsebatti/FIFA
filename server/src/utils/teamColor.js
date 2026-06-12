export const DEFAULT_TEAM_COLOR = '#FF6D00';

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function normalizeTeamColor(color) {
  if (!color) return DEFAULT_TEAM_COLOR;
  const trimmed = String(color).trim();
  if (!HEX_REGEX.test(trimmed)) return null;
  return trimmed.toUpperCase();
}
