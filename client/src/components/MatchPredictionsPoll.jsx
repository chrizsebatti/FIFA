import { useAuth } from '../context/AuthContext';

function pickLabel(winner) {
  return winner === 'draw' ? 'Draw' : winner;
}

export default function MatchPredictionsPoll({ participants, isLive }) {
  const { user } = useAuth();

  const isMe = (entry) => entry.userId === user?._id;

  return (
    <div className="mt-6 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          All Predictions ({participants.length})
        </h3>
        <p className="text-xs text-gray-500">
          {isLive
            ? 'See what everyone picked for this live match'
            : 'See what others have predicted for this match'}
        </p>
      </div>

      {participants.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          No predictions yet — be the first to pick!
        </p>
      ) : (
        <div className="space-y-2">
          {participants.map((entry) => (
            <div
              key={entry.userId || entry.rank}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                isMe(entry)
                  ? 'border-[#FF6D00]/40 bg-[#FF6D00]/5'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                {entry.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">
                  {entry.displayName}
                  {isMe(entry) && (
                    <span className="ml-1 text-xs font-semibold text-[#FF6D00]">(You)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Pick: {pickLabel(entry.predictedWinner)} ({entry.scoreA}-{entry.scoreB})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
