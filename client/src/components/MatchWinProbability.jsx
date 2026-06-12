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
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
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
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div>
        <p className="text-sm font-medium text-white/80">Crowd win probability</p>
        <p className="mt-1 text-xs text-white/50">
          Based on {totalPredictions} prediction{totalPredictions !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col items-center gap-1">
          <span
            className={`text-lg font-bold ${
              favorite.pick === match.teamA ? 'text-fifa-gold' : 'text-white/80'
            }`}
          >
            {teamAPct}%
          </span>
          <div className="flex h-24 w-full items-end rounded-lg bg-white/10 p-1">
            <div
              className={`w-full rounded-md transition-all ${
                favorite.pick === match.teamA ? 'bg-fifa-gold' : 'bg-fifa-green/70'
              }`}
              style={{ height: `${Math.max(teamAPct, 4)}%` }}
            />
          </div>
          <span className="text-center text-xs text-white/60">{match.teamA}</span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <span
            className={`text-lg font-bold ${
              favorite.pick === 'draw' ? 'text-fifa-gold' : 'text-white/80'
            }`}
          >
            {drawPct}%
          </span>
          <div className="flex h-24 w-full items-end rounded-lg bg-white/10 p-1">
            <div
              className={`w-full rounded-md transition-all ${
                favorite.pick === 'draw' ? 'bg-fifa-gold' : 'bg-white/40'
              }`}
              style={{ height: `${Math.max(drawPct, 4)}%` }}
            />
          </div>
          <span className="text-center text-xs text-white/60">Draw</span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <span
            className={`text-lg font-bold ${
              favorite.pick === match.teamB ? 'text-fifa-gold' : 'text-white/80'
            }`}
          >
            {teamBPct}%
          </span>
          <div className="flex h-24 w-full items-end rounded-lg bg-white/10 p-1">
            <div
              className={`w-full rounded-md transition-all ${
                favorite.pick === match.teamB ? 'bg-fifa-gold' : 'bg-fifa-green/70'
              }`}
              style={{ height: `${Math.max(teamBPct, 4)}%` }}
            />
          </div>
          <span className="text-center text-xs text-white/60">{match.teamB}</span>
        </div>
      </div>

      <p className="text-sm text-white/70">
        <span className="font-semibold text-fifa-gold">{favoriteLabel}</span> has the highest
        win prediction ({favorite.percentage}%)
      </p>

      {selectedWinner && (
        <p className="text-xs text-white/50">
          {selectedWinner === favorite.pick ? (
            <>
              Your pick matches the crowd — {selectedPct}% of users agree
            </>
          ) : (
            <>
              You picked <span className="text-fifa-gold">{pickLabel(selectedWinner)}</span>{' '}
              ({selectedPct}%) — going against the crowd favorite
            </>
          )}
        </p>
      )}
    </div>
  );
}
