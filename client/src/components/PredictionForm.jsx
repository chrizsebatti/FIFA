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
        <label className="mb-2 block text-sm font-medium text-gray-600">
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
                    ? 'border-[#FF6D00] bg-[#FF6D00]/15 text-[#FF6D00]'
                    : isFavorite
                      ? 'border-fifa-green/40 bg-fifa-green/5 text-gray-800'
                      : 'border-gray-200 bg-gray-50 text-gray-700'
                } ${locked ? 'opacity-50' : 'active:scale-95'}`}
              >
                <span className="block">{label}</span>
                {pct != null && predictionStats.totalPredictions > 0 && (
                  <span className={`mt-0.5 block text-xs ${isFavorite ? 'text-fifa-green' : 'text-gray-400'}`}>
                    {pct}%{isFavorite ? ' ★' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-600">
          Predicted score
        </label>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="mb-1 text-xs text-gray-500">{match.teamA}</p>
            <input
              type="number"
              min="0"
              value={scoreA}
              disabled={locked}
              onChange={(e) => setScoreA(e.target.value)}
              className="w-20 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-2xl font-bold outline-none focus:border-fifa-green"
            />
          </div>
          <span className="text-2xl text-gray-400">-</span>
          <div className="text-center">
            <p className="mb-1 text-xs text-gray-500">{match.teamB}</p>
            <input
              type="number"
              min="0"
              value={scoreB}
              disabled={locked}
              onChange={(e) => setScoreB(e.target.value)}
              className="w-20 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-2xl font-bold outline-none focus:border-fifa-green"
            />
          </div>
        </div>
      </div>

      {!locked && (
        <button
          type="submit"
          disabled={loading || !predictedWinner}
          className="w-full min-h-[48px] rounded-xl bg-[#FF6D00] font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
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
