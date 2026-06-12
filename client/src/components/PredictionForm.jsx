import { useMemo, useState } from 'react';
import MatchWinProbability from './MatchWinProbability';
import ScorePickerModal from './ScorePickerModal';
import TeamFlag from './TeamFlag';
import { getTeamEmoji } from '../utils/teamEmoji';

function deriveWinner(match, scoreA, scoreB) {
  const a = Number(scoreA) || 0;
  const b = Number(scoreB) || 0;
  if (a > b) return match.teamA;
  if (b > a) return match.teamB;
  return 'draw';
}

function pickLabel(pick) {
  return pick === 'draw' ? 'Draw' : pick;
}

export default function PredictionForm({
  match,
  scoreA,
  setScoreA,
  scoreB,
  setScoreB,
  onSubmit,
  loading,
  locked,
  predictionStats,
  teamEmojiMap = {},
}) {
  const [pickerTeam, setPickerTeam] = useState(null);

  const predictedWinner = useMemo(
    () => deriveWinner(match, scoreA, scoreB),
    [match, scoreA, scoreB]
  );

  const distByPick = predictionStats?.distribution
    ? Object.fromEntries(predictionStats.distribution.map((d) => [d.pick, d]))
    : {};

  const openPicker = (team) => {
    if (!locked) setPickerTeam(team);
  };

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
        <label className="mb-3 block text-center text-sm font-medium text-gray-600">
          Tap a team to set goals
        </label>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={locked}
              onClick={() => openPicker('A')}
              className={`min-w-0 flex-1 rounded-xl border-2 px-3 py-4 text-center transition active:scale-[0.98] disabled:opacity-50 ${
                predictedWinner === match.teamA
                  ? 'border-[#FF6D00] bg-[#FF6D00]/10'
                  : predictedWinner === 'draw'
                    ? 'border-[#FF6D00]/40 bg-[#FF6D00]/5'
                    : 'border-gray-200 bg-gray-50 hover:border-[#FF6D00]/40'
              }`}
            >
              <TeamFlag
                emoji={getTeamEmoji(teamEmojiMap, match.teamA)}
                name={match.teamA}
                size="md"
                className="mx-auto"
              />
              <p className="mt-2 truncate text-sm font-semibold text-gray-900">{match.teamA}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#FF6D00]">{scoreA}</p>
            </button>

            <div className="shrink-0 text-center">
              <p className="text-2xl font-bold tabular-nums text-gray-900">
                {scoreA}
                <span className="mx-1 text-gray-300">–</span>
                {scoreB}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {pickLabel(predictedWinner)}
              </p>
            </div>

            <button
              type="button"
              disabled={locked}
              onClick={() => openPicker('B')}
              className={`min-w-0 flex-1 rounded-xl border-2 px-3 py-4 text-center transition active:scale-[0.98] disabled:opacity-50 ${
                predictedWinner === match.teamB
                  ? 'border-[#FF6D00] bg-[#FF6D00]/10'
                  : predictedWinner === 'draw'
                    ? 'border-[#FF6D00]/40 bg-[#FF6D00]/5'
                    : 'border-gray-200 bg-gray-50 hover:border-[#FF6D00]/40'
              }`}
            >
              <TeamFlag
                emoji={getTeamEmoji(teamEmojiMap, match.teamB)}
                name={match.teamB}
                size="md"
                className="mx-auto"
              />
              <p className="mt-2 truncate text-sm font-semibold text-gray-900">{match.teamB}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#FF6D00]">{scoreB}</p>
            </button>
          </div>

          {predictionStats?.totalPredictions > 0 && (
            <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400">
              {[match.teamA, 'draw', match.teamB].map((pick) => {
                const pct = distByPick[pick]?.percentage;
                if (pct == null) return null;
                const isPick = predictedWinner === pick;
                return (
                  <span key={pick} className={isPick ? 'font-semibold text-[#FF6D00]' : ''}>
                    {pickLabel(pick)} {pct}%
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {pickerTeam && (
        <ScorePickerModal
          teamName={pickerTeam === 'A' ? match.teamA : match.teamB}
          teamEmoji={getTeamEmoji(
            teamEmojiMap,
            pickerTeam === 'A' ? match.teamA : match.teamB
          )}
          score={pickerTeam === 'A' ? scoreA : scoreB}
          onChange={pickerTeam === 'A' ? setScoreA : setScoreB}
          onClose={() => setPickerTeam(null)}
        />
      )}

      {!locked && (
        <button
          type="submit"
          disabled={loading}
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
