export function buildTeamEmojiMap(teams) {
  const map = {};
  for (const team of teams) {
    map[team.name.toLowerCase()] = team.emoji || '';
  }
  return map;
}

export function buildTeamMetaMap(teams) {
  const map = {};
  for (const team of teams) {
    map[team.name.toLowerCase()] = {
      emoji: team.emoji || '',
      color: team.color || '#FF6D00',
    };
  }
  return map;
}

export function getTeamEmoji(teamEmojiMap, teamName) {
  if (!teamName || !teamEmojiMap) return '';
  return teamEmojiMap[teamName.toLowerCase()] || '';
}

export function getTeamMeta(teamMetaMap, teamName) {
  if (!teamName || !teamMetaMap) {
    return { emoji: '', color: '#FF6D00' };
  }
  return teamMetaMap[teamName.toLowerCase()] || { emoji: '', color: '#FF6D00' };
}
