import BracketMatch from '../models/BracketMatch.js';
import { buildBracketTopology } from './bracketTopology.js';

export async function seedBracketMatches() {
  const topology = buildBracketTopology();
  const existing = await BracketMatch.countDocuments();

  if (existing > 0) {
    return { seeded: false, count: existing, message: 'Bracket already seeded' };
  }

  await BracketMatch.insertMany(
    topology.map((m) => ({
      ...m,
      teamA: null,
      teamB: null,
      actualWinner: null,
    }))
  );

  return { seeded: true, count: topology.length };
}
