export function buildMatchDistribution(match, predictions) {
  const totalPredictions = predictions.length;
  const picks = [match.teamA, match.teamB, 'draw'];

  const distribution = picks.map((pick) => {
    const count = predictions.filter((p) => p.predictedWinner === pick).length;
    return {
      pick,
      count,
      percentage: totalPredictions
        ? Math.round((count / totalPredictions) * 100)
        : 0,
    };
  });

  const favorite = distribution.reduce((best, item) =>
    item.percentage > best.percentage ? item : best
  );

  return { distribution, totalPredictions, favorite };
}
