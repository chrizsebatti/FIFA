import MatchWinProbability from './MatchWinProbability';

function pickLabel(pick) {
  return pick === 'draw' ? 'Draw' : pick;
}

export default function PredictionForm({
  match,
  predictedWinner,
  setPredictedWinner,
  scoreA,
  setScoreA,
  scoreB,
  setScoreB,
  onSubmit,
  loading,
  locked,
  predictionStats,
}) {
  const distByPick = predictionStats?.distribution
    ? Object.fromEntries(predictionStats.distribution.map((d) => [d.pick, d]))
    : {};

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {predictionStats && (
        <MatchWinProbability
          match={match}
          distribution={predictionStats.distribution}
          totalPredictions={predictionStats.totalPredictions}
          favorite={predictionStats.favorite}
          selectedWinner={predictedWinner}
        />
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">
          Who will win?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[match.teamA, 'draw', match.teamB].map((option) => {
            const label = pickLabel(option);
            const selected = predictedWinner === option;
            const pct = distByPick[option]?.percentage;
            const isFavorite =
              predictionStats?.favorite?.pick === option &&
              predictionStats?.totalPredictions > 0;
            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={() => setPredictedWinner(option)}
                className={`min-h-[56px] rounded-xl border px-2 py-2 text-sm font-medium transition ${
                  selected
                    ? 'border-fifa-gold bg-fifa-gold/20 text-fifa-gold'
                    : isFavorite
                      ? 'border-fifa-gold/40 bg-fifa-gold/5 text-white/90'
                      : 'border-white/10 bg-white/5 text-white/80'
                } ${locked ? 'opacity-50' : 'active:scale-95'}`}
              >
                <span className="block">{label}</span>
                {pct != null && predictionStats.totalPredictions > 0 && (
                  <span className={`mt-0.5 block text-xs ${isFavorite ? 'text-fifa-gold' : 'text-white/40'}`}>
                    {pct}%{isFavorite ? ' ★' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">
          Predicted score
        </label>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="mb-1 text-xs text-white/50">{match.teamA}</p>
            <input
              type="number"
              min="0"
              value={scoreA}
              disabled={locked}
              onChange={(e) => setScoreA(e.target.value)}
              className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-2xl font-bold outline-none focus:border-fifa-gold"
            />
          </div>
          <span className="text-2xl text-white/30">-</span>
          <div className="text-center">
            <p className="mb-1 text-xs text-white/50">{match.teamB}</p>
            <input
              type="number"
              min="0"
              value={scoreB}
              disabled={locked}
              onChange={(e) => setScoreB(e.target.value)}
              className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-2xl font-bold outline-none focus:border-fifa-gold"
            />
          </div>
        </div>
      </div>

      {!locked && (
        <button
          type="submit"
          disabled={loading || !predictedWinner}
          className="w-full min-h-[48px] rounded-xl bg-fifa-green font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Prediction'}
        </button>
      )}

      {locked && (
        <div className="rounded-xl bg-red-600/20 px-4 py-3 text-center text-sm text-red-300">
          {match.status === 'finished'
            ? 'Match finished — predictions are closed'
            : 'Game started — predictions are closed'}
        </div>
      )}
    </form>
  );
}
