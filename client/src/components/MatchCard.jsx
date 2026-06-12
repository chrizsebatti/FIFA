import { Link } from 'react-router-dom';
import MatchCountdown from './MatchCountdown';
import { formatDateTime, getMatchStatus, statusLabel } from '../utils/format';

function pickLabel(winner) {
  return winner === 'draw' ? 'Draw' : winner;
}

export default function MatchCard({ match, prediction, returnTo = '/matches' }) {
  const status = getMatchStatus(match);
  const badge = statusLabel(status);
  const isFinished = match.status === 'finished';

  return (
    <Link
      to={`/matches/${match._id}/predict#predict`}
      state={{ from: returnTo }}
      className="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition active:scale-[0.98]"
    >
      <div className="p-4">
        {match.stage && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#FF6D00]">
            {match.stage}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 text-center">
            <p className="font-semibold text-gray-900">{match.teamA}</p>
            {isFinished && (
              <p className="mt-1 text-2xl font-bold text-gray-900">{match.scoreA}</p>
            )}
          </div>
          <div className="text-center text-xs font-medium uppercase text-gray-400">vs</div>
          <div className="flex-1 text-center">
            <p className="font-semibold text-gray-900">{match.teamB}</p>
            {isFinished && (
              <p className="mt-1 text-2xl font-bold text-gray-900">{match.scoreB}</p>
            )}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {!isFinished && (
            <MatchCountdown
              startTime={match.startTime}
              isFinished={isFinished}
              isLive={status === 'started'}
              size="compact"
              className="w-full"
            />
          )}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-gray-500">{formatDateTime(match.startTime)}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
              {badge.text}
            </span>
          </div>
        </div>
      </div>

      {prediction && (
        <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Your pick
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">
                {pickLabel(prediction.predictedWinner)}
              </p>
              <p className="text-xs text-gray-500">
                Predicted score {prediction.scoreA}–{prediction.scoreB}
              </p>
            </div>
            {isFinished ? (
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
                  prediction.pointsEarned > 0
                    ? 'border-[#008631] text-[#008631]'
                    : 'border-gray-300 text-gray-500'
                }`}
              >
                {prediction.pointsEarned > 0 ? `+${prediction.pointsEarned}` : '0'} pts
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Locked in
              </span>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
