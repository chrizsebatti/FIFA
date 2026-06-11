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
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">
          Who will win?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[match.teamA, 'draw', match.teamB].map((option) => {
            const label = option === 'draw' ? 'Draw' : option;
            const selected = predictedWinner === option;
            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={() => setPredictedWinner(option)}
                className={`min-h-[48px] rounded-xl border px-2 py-3 text-sm font-medium transition ${
                  selected
                    ? 'border-fifa-gold bg-fifa-gold/20 text-fifa-gold'
                    : 'border-white/10 bg-white/5 text-white/80'
                } ${locked ? 'opacity-50' : 'active:scale-95'}`}
              >
                {label}
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
          Predictions are closed for this match
        </div>
      )}
    </form>
  );
}
