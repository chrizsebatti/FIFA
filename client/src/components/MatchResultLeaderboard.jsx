import { useAuth } from '../context/AuthContext';
import Confetti from './Confetti';

function pickLabel(winner) {
  return winner === 'draw' ? 'Draw' : winner;
}

export default function MatchResultLeaderboard({ match, participants }) {
  const { user } = useAuth();
  const winners = participants.filter((p) => p.isWinner);

  const isMe = (entry) => entry.userId === user?._id;

  const rowClass = (entry) => {
    if (entry.pointsEarned === 100) {
      return 'border-fifa-gold/60 bg-fifa-gold/15';
    }
    if (entry.pointsEarned === 50) {
      return 'border-fifa-green/50 bg-fifa-green/10';
    }
    if (isMe(entry)) {
      return 'border-white/20 bg-white/10';
    }
    return 'border-white/10 bg-white/5';
  };

  const isDraw = match.winner === 'draw';

  return (
    <div className="relative space-y-4">
      <Confetti active />
      <div className="rounded-xl border border-fifa-gold/30 bg-fifa-gold/10 p-4 text-center">
        <p className="text-xs uppercase tracking-wide text-fifa-gold">Final Result</p>
        <p className="mt-2 text-3xl font-bold">
          {match.scoreA} - {match.scoreB}
        </p>
        <div className="mt-3 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold shadow-lg ${
              isDraw
                ? 'border-white/30 bg-white/10 text-white'
                : 'border-fifa-gold bg-fifa-gold/25 text-fifa-gold animate-winner-capsule'
            }`}
          >
            {!isDraw && <span>🏆</span>}
            Winner: {pickLabel(match.winner)}
          </span>
        </div>
      </div>

      {winners.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-fifa-gold">
            Winners ({winners.length})
          </h3>
          <div className="space-y-2">
            {winners.map((entry) => (
              <ParticipantRow
                key={`winner-${entry.rank}`}
                entry={entry}
                isMe={isMe(entry)}
                className={rowClass(entry)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-white/70">
          All Participants ({participants.length})
        </h3>
        {participants.length === 0 ? (
          <p className="text-sm text-white/50">No predictions for this match</p>
        ) : (
          <div className="space-y-2">
            {participants.map((entry) => (
              <ParticipantRow
                key={entry.rank}
                entry={entry}
                isMe={isMe(entry)}
                className={rowClass(entry)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantRow({ entry, isMe, className }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${className}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          entry.pointsEarned === 100
            ? 'bg-fifa-gold text-black'
            : entry.pointsEarned === 50
              ? 'bg-fifa-green text-white'
              : 'bg-white/10'
        }`}
      >
        {entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {entry.displayName}
          {isMe && <span className="ml-1 text-xs text-fifa-gold">(You)</span>}
        </p>
        <p className="text-xs text-white/50">
          Pick: {pickLabel(entry.predictedWinner)} ({entry.scoreA}-{entry.scoreB})
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`text-lg font-bold ${
            entry.pointsEarned > 0 ? 'text-fifa-gold' : 'text-white/30'
          }`}
        >
          {entry.pointsEarned > 0 ? `+${entry.pointsEarned}` : '0'}
        </p>
        <p className="text-[10px] text-white/40">pts</p>
      </div>
    </div>
  );
}
