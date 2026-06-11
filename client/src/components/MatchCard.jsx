import { Link } from 'react-router-dom';
import { formatDateTime, getMatchStatus, statusLabel } from '../utils/format';

export default function MatchCard({ match, prediction }) {
  const status = getMatchStatus(match);
  const badge = statusLabel(status);

  return (
    <Link
      to={`/matches/${match._id}/predict`}
      className="block rounded-xl border border-white/10 bg-white/5 p-4 transition active:scale-[0.98]"
    >
      {match.stage && (
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-fifa-gold">
          {match.stage}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-center">
          <p className="font-semibold">{match.teamA}</p>
          {match.status === 'finished' && (
            <p className="text-2xl font-bold text-fifa-gold">{match.scoreA}</p>
          )}
        </div>
        <div className="text-center text-sm text-white/40">vs</div>
        <div className="flex-1 text-center">
          <p className="font-semibold">{match.teamB}</p>
          {match.status === 'finished' && (
            <p className="text-2xl font-bold text-fifa-gold">{match.scoreB}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-white/50">{formatDateTime(match.startTime)}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.text}
        </span>
      </div>
      {prediction && (
        <div className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70">
          Your pick: {prediction.predictedWinner === 'draw' ? 'Draw' : prediction.predictedWinner}{' '}
          ({prediction.scoreA}-{prediction.scoreB})
          {prediction.pointsEarned > 0 && (
            <span className="ml-2 font-semibold text-fifa-gold">
              +{prediction.pointsEarned} pts
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
