function pickLabel(pick) {
  return pick === 'draw' ? 'Draw' : pick;
}

export default function MatchWinProbability({
  match,
  distribution,
  totalPredictions,
  favorite,
  selectedWinner,
}) {
  if (!distribution?.length) return null;

  const distByPick = Object.fromEntries(distribution.map((d) => [d.pick, d]));

  if (totalPredictions === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
        No predictions yet — be the first to pick!
      </div>
    );
  }

  const teamAPct = distByPick[match.teamA]?.percentage ?? 0;
  const teamBPct = distByPick[match.teamB]?.percentage ?? 0;
  const drawPct = distByPick.draw?.percentage ?? 0;

  const favoriteLabel = pickLabel(favorite.pick);
  const selectedPct = selectedWinner ? distByPick[selectedWinner]?.percentage ?? 0 : null;

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div>
        <p className="text-sm font-medium text-gray-700">Crowd win probability</p>
        <p className="mt-1 text-xs text-gray-500">
          Based on {totalPredictions} prediction{totalPredictions !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col items-center gap-1">
          <span
            className={`text-lg font-bold ${
              favorite.pick === match.teamA ? 'text-fifa-green' : 'text-gray-700'
            }`}
          >
            {teamAPct}%
          </span>
          <div className="flex h-24 w-full items-end rounded-lg bg-gray-100 p-1">
            <div
              className={`w-full rounded-md transition-all ${
                favorite.pick === match.teamA ? 'bg-fifa-green' : 'bg-fifa-green/40'
              }`}
              style={{ height: `${Math.max(teamAPct, 4)}%` }}
            />
          </div>
          <span className="text-center text-xs text-gray-500">{match.teamA}</span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <span
            className={`text-lg font-bold ${
              favorite.pick === 'draw' ? 'text-fifa-green' : 'text-gray-700'
            }`}
          >
            {drawPct}%
          </span>
          <div className="flex h-24 w-full items-end rounded-lg bg-gray-100 p-1">
            <div
              className={`w-full rounded-md transition-all ${
                favorite.pick === 'draw' ? 'bg-fifa-green' : 'bg-gray-200'
              }`}
              style={{ height: `${Math.max(drawPct, 4)}%` }}
            />
          </div>
          <span className="text-center text-xs text-gray-500">Draw</span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <span
            className={`text-lg font-bold ${
              favorite.pick === match.teamB ? 'text-fifa-green' : 'text-gray-700'
            }`}
          >
            {teamBPct}%
          </span>
          <div className="flex h-24 w-full items-end rounded-lg bg-gray-100 p-1">
            <div
              className={`w-full rounded-md transition-all ${
                favorite.pick === match.teamB ? 'bg-fifa-green' : 'bg-fifa-green/40'
              }`}
              style={{ height: `${Math.max(teamBPct, 4)}%` }}
            />
          </div>
          <span className="text-center text-xs text-gray-500">{match.teamB}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        <span className="font-semibold text-fifa-green">{favoriteLabel}</span> has the highest
        win prediction ({favorite.percentage}%)
      </p>

      {selectedWinner && (
        <p className="text-xs text-gray-500">
          {selectedWinner === favorite.pick ? (
            <>
              Your pick matches the crowd — {selectedPct}% of users agree
            </>
          ) : (
            <>
              You picked <span className="text-fifa-green">{pickLabel(selectedWinner)}</span>{' '}
              ({selectedPct}%) — going against the crowd favorite
            </>
          )}
        </p>
      )}
    </div>
  );
}
