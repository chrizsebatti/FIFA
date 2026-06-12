import { useAuth } from '../context/AuthContext';
import Confetti from './Confetti';

function pickLabel(winner) {
  return winner === 'draw' ? 'Draw' : winner;
}

export default function MatchResultLeaderboard({ match, participants }) {
  const { user } = useAuth();
  const winners = participants.filter((p) => p.isWinner);

  const isMe = (entry) => entry.userId === user?._id;

  const winnerRowClass = (entry) => {
    if (entry.pointsEarned === 100) {
      return 'border-[#008631] bg-[#008631]/10';
    }
    return 'border-[#008631]/70 bg-[#008631]/5';
  };

  const participantRowClass = (entry) => {
    if (isMe(entry)) {
      return 'border-gray-300 bg-gray-100';
    }
    return 'border-gray-200 bg-gray-50';
  };

  const isDraw = match.winner === 'draw';

  return (
    <div className="relative space-y-4">
      <Confetti active />
      <div className="rounded-xl border border-fifa-yellow/40 bg-fifa-yellow/10 p-4 text-center">
        <p className="text-xs uppercase tracking-wide text-fifa-yellow">Final Result</p>
        <p className="mt-2 text-3xl font-bold">
          {match.scoreA} - {match.scoreB}
        </p>
        <div className="mt-3 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold shadow-lg ${
              isDraw
                ? 'border-gray-300 bg-gray-100 text-gray-900'
                : 'border-fifa-yellow bg-fifa-yellow/25 text-orange-950 animate-winner-capsule'
            }`}
          >
            {!isDraw && <span>🏆</span>}
            Winner: {pickLabel(match.winner)}
          </span>
        </div>
      </div>

      {winners.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#008631]">
            Winners ({winners.length})
          </h3>
          <div className="space-y-2">
            {winners.map((entry) => (
              <ParticipantRow
                key={`winner-${entry.rank}`}
                entry={entry}
                isMe={isMe(entry)}
                className={winnerRowClass(entry)}
                highlightWinner
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-600">
          All Participants ({participants.length})
        </h3>
        {participants.length === 0 ? (
          <p className="text-sm text-gray-500">No predictions for this match</p>
        ) : (
          <div className="space-y-2">
            {participants.map((entry) => (
              <ParticipantRow
                key={entry.rank}
                entry={entry}
                isMe={isMe(entry)}
                className={participantRowClass(entry)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantRow({ entry, isMe, className, highlightWinner = false }) {
  const rankBadgeClass = highlightWinner
    ? entry.pointsEarned === 100
      ? 'bg-[#008631] text-white'
      : 'border-2 border-[#008631] text-[#008631]'
    : 'bg-gray-100 text-gray-600';

  const pointsClass = highlightWinner
    ? 'text-[#008631]'
    : entry.pointsEarned > 0
      ? 'text-gray-900'
      : 'text-gray-400';

  const ptsLabelClass = highlightWinner
    ? 'text-[#008631]/70'
    : 'text-gray-400';

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${className}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankBadgeClass}`}
      >
        {entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {entry.displayName}
          {isMe && <span className="ml-1 text-xs text-fifa-primary">(You)</span>}
        </p>
        <p className="text-xs text-gray-500">
          Pick: {pickLabel(entry.predictedWinner)} ({entry.scoreA}-{entry.scoreB})
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-lg font-bold ${pointsClass}`}>
          {entry.pointsEarned > 0 ? `+${entry.pointsEarned}` : '0'}
        </p>
        <p className={`text-[10px] ${ptsLabelClass}`}>pts</p>
      </div>
    </div>
  );
}
