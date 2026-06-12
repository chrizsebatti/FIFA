export function buildTeamEmojiMap(teams) {
  const map = {};
  for (const team of teams) {
    map[team.name.toLowerCase()] = team.emoji || '';
  }
  return map;
}

export function getTeamEmoji(teamEmojiMap, teamName) {
  if (!teamName || !teamEmojiMap) return '';
  return teamEmojiMap[teamName.toLowerCase()] || '';
}
