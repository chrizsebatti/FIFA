/** Standard single-elimination knockout: 16 R32 → 8 R16 → 4 QF → 2 SF → 1 Final */

export const BRACKET_STAGES = ['r16', 'r8', 'r4', 'r2', 'winner'];

export const ROUND_TO_STAGE = {
  r32: 'r16',
  r16: 'r8',
  qf: 'r4',
  sf: 'r2',
  final: 'winner',
};

export const STAGE_LABELS = {
  r16: 'Round of 16',
  r8: 'Round of 8',
  r4: 'Round of 4',
  r2: 'Round of 2',
  winner: 'Final Winner',
};

export const STAGE_MAX_TEAMS = {
  r16: 16,
  r8: 8,
  r4: 4,
  r2: 2,
  winner: 1,
};

export function buildBracketTopology() {
  const matches = [];

  for (let i = 1; i <= 16; i += 1) {
    matches.push({
      key: `r32-m${i}`,
      round: 'r32',
      matchIndex: i - 1,
      feedsFromA: null,
      feedsFromB: null,
      feedsIntoKey: `r16-m${Math.ceil(i / 2)}`,
      feedsIntoSlot: i % 2 === 1 ? 'A' : 'B',
    });
  }

  for (let i = 1; i <= 8; i += 1) {
    matches.push({
      key: `r16-m${i}`,
      round: 'r16',
      matchIndex: i - 1,
      feedsFromA: `r32-m${i * 2 - 1}`,
      feedsFromB: `r32-m${i * 2}`,
      feedsIntoKey: `qf-m${Math.ceil(i / 2)}`,
      feedsIntoSlot: i % 2 === 1 ? 'A' : 'B',
    });
  }

  for (let i = 1; i <= 4; i += 1) {
    matches.push({
      key: `qf-m${i}`,
      round: 'qf',
      matchIndex: i - 1,
      feedsFromA: `r16-m${i * 2 - 1}`,
      feedsFromB: `r16-m${i * 2}`,
      feedsIntoKey: `sf-m${Math.ceil(i / 2)}`,
      feedsIntoSlot: i % 2 === 1 ? 'A' : 'B',
    });
  }

  for (let i = 1; i <= 2; i += 1) {
    matches.push({
      key: `sf-m${i}`,
      round: 'sf',
      matchIndex: i - 1,
      feedsFromA: `qf-m${i * 2 - 1}`,
      feedsFromB: `qf-m${i * 2}`,
      feedsIntoKey: 'final',
      feedsIntoSlot: i === 1 ? 'A' : 'B',
    });
  }

  matches.push({
    key: 'final',
    round: 'final',
    matchIndex: 0,
    feedsFromA: 'sf-m1',
    feedsFromB: 'sf-m2',
    feedsIntoKey: null,
    feedsIntoSlot: null,
  });

  return matches;
}

export const BRACKET_MATCH_COUNT = buildBracketTopology().length;
