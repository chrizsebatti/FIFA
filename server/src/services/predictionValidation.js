export function validatePredictionConsistency(match, predictedWinner, scoreA, scoreB) {
  if (predictedWinner === match.teamA && scoreA <= scoreB) {
    return `You picked ${match.teamA} to win, but the score has ${match.teamA} with ${scoreA} and ${match.teamB} with ${scoreB}. ${match.teamA} must have the higher score.`;
  }

  if (predictedWinner === match.teamB && scoreB <= scoreA) {
    return `You picked ${match.teamB} to win, but the score has ${match.teamA} with ${scoreA} and ${match.teamB} with ${scoreB}. ${match.teamB} must have the higher score.`;
  }

  if (predictedWinner === 'draw' && scoreA !== scoreB) {
    return `You picked a draw, but the scores are ${scoreA}-${scoreB}. Both scores must be equal.`;
  }

  return null;
}
