export function picksToMap(picks) {
  const map = {};
  for (const p of picks || []) {
    map[p.bracketMatchKey] = p.pickedTeam;
  }
  return map;
}

export function picksMapToArray(picksMap) {
  return Object.entries(picksMap).map(([bracketMatchKey, pickedTeam]) => ({
    bracketMatchKey,
    pickedTeam,
  }));
}

function getWinner(match, picksMap, useActual) {
  if (useActual) return match.actualWinner || null;
  return picksMap[match.key] || null;
}

export function resolveMatchTeams(match, matchesByKey, picksMap, useActual = false) {
  if (match.round === 'r32') {
    return { teamA: match.teamA, teamB: match.teamB };
  }
  const resolveFeed = (feedKey) => {
    if (!feedKey) return null;
    const parent = matchesByKey[feedKey];
    if (!parent) return null;
    return getWinner(parent, picksMap, useActual);
  };
  return {
    teamA: resolveFeed(match.feedsFromA),
    teamB: resolveFeed(match.feedsFromB),
  };
}

export function buildResolvedMatches(matches, picksMap) {
  const matchesByKey = Object.fromEntries(matches.map((m) => [m.key, m]));
  return matches.map((match) => {
    const { teamA, teamB } = resolveMatchTeams(match, matchesByKey, picksMap, false);
    return {
      ...match,
      resolvedTeamA: teamA,
      resolvedTeamB: teamB,
      resolvedWinner: picksMap[match.key] || null,
    };
  });
}

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'];

export function applyPick(matches, picksMap, matchKey, team) {
  const next = { ...picksMap, [matchKey]: team };
  const match = matches.find((m) => m.key === matchKey);
  if (!match) return next;

  const roundIdx = ROUND_ORDER.indexOf(match.round);
  for (const m of matches) {
    if (ROUND_ORDER.indexOf(m.round) > roundIdx) {
      delete next[m.key];
    }
  }
  return next;
}
