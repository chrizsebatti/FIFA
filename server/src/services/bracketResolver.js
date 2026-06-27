import {
  ROUND_TO_STAGE,
  STAGE_MAX_TEAMS,
} from './bracketTopology.js';

const ROUND_FOR_STAGE = {
  r16: 'r32',
  r8: 'r16',
  r4: 'qf',
  r2: 'sf',
  winner: 'final',
};

export function picksToMap(picks) {
  return new Map((picks || []).map((p) => [p.bracketMatchKey, p.pickedTeam]));
}

export function getWinnerForMatch(match, picksMap, useActual) {
  if (useActual) return match.actualWinner || null;
  return picksMap.get(match.key) || null;
}

export function resolveMatchTeams(match, matchesByKey, picksMap, useActual) {
  if (match.round === 'r32') {
    return {
      teamA: match.teamA,
      teamB: match.teamB,
    };
  }

  const resolveFeed = (feedKey) => {
    if (!feedKey) return null;
    const parent = matchesByKey.get(feedKey);
    if (!parent) return null;
    return getWinnerForMatch(parent, picksMap, useActual);
  };

  return {
    teamA: resolveFeed(match.feedsFromA),
    teamB: resolveFeed(match.feedsFromB),
  };
}

export function getRoundWinners(matches, picksMap, round, useActual) {
  return matches
    .filter((m) => m.round === round)
    .sort((a, b) => a.matchIndex - b.matchIndex)
    .map((m) => getWinnerForMatch(m, picksMap, useActual))
    .filter(Boolean);
}

export function getTeamsAtStage(matches, picksMap, stage, useActual) {
  if (stage === 'winner') {
    const final = matches.find((m) => m.key === 'final');
    const winner = final ? getWinnerForMatch(final, picksMap, useActual) : null;
    return winner ? [winner] : [];
  }

  const round = ROUND_FOR_STAGE[stage];
  return getRoundWinners(matches, picksMap, round, useActual);
}

export function countStageIntersection(userTeams, actualTeams) {
  const actualSet = new Set(actualTeams);
  return userTeams.filter((team) => actualSet.has(team)).length;
}

export function isRoundComplete(matches, round) {
  const roundMatches = matches.filter((m) => m.round === round);
  if (roundMatches.length === 0) return false;
  return roundMatches.every((m) => {
    if (round === 'r32') {
      return Boolean(m.teamA && m.teamB);
    }
    const { teamA, teamB } = resolveMatchTeams(
      m,
      new Map(matches.map((x) => [x.key, x])),
      new Map(),
      true
    );
    return Boolean(m.actualWinner && teamA && teamB);
  });
}

export function isRoundResultsComplete(matches, round) {
  const roundMatches = matches.filter((m) => m.round === round);
  if (roundMatches.length === 0) return false;
  return roundMatches.every((m) => Boolean(m.actualWinner));
}

export function getStageForCompletedRound(round) {
  return ROUND_TO_STAGE[round] || null;
}

export function buildResolvedBracket(matches, picksMap, useActual) {
  const matchesByKey = new Map(matches.map((m) => [m.key, m]));

  return matches.map((match) => {
    const { teamA, teamB } = resolveMatchTeams(match, matchesByKey, picksMap, useActual);
    const winner = getWinnerForMatch(match, picksMap, useActual);
    return {
      ...match,
      resolvedTeamA: teamA,
      resolvedTeamB: teamB,
      resolvedWinner: winner,
    };
  });
}

export function validateSubmissionPicks(matches, picks) {
  if (picks.length !== matches.length) {
    return `Expected ${matches.length} picks, got ${picks.length}`;
  }

  const picksMap = picksToMap(picks);
  const matchesByKey = new Map(matches.map((m) => [m.key, m]));

  for (const match of matches) {
    const picked = picksMap.get(match.key);
    if (!picked) {
      return `Missing pick for ${match.key}`;
    }
    const { teamA, teamB } = resolveMatchTeams(match, matchesByKey, picksMap, false);
    if (!teamA || !teamB) {
      return `Cannot resolve teams for ${match.key}`;
    }
    if (picked !== teamA && picked !== teamB) {
      return `Invalid pick for ${match.key}: must be ${teamA} or ${teamB}`;
    }
  }

  return null;
}

export function getStageMaxCount(stage) {
  return STAGE_MAX_TEAMS[stage] || 0;
}
