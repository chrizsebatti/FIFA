const STAGE_LABELS = {
  r16: 'Round of 16',
  r8: 'Round of 8',
  r4: 'Round of 4',
  r2: 'Round of 2',
  winner: 'Champion',
};

export default function BracketStageScores({ stageScores }) {
  if (!stageScores?.length) return null;

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Stage scores
      </p>
      <div className="flex flex-wrap gap-2">
        {stageScores.map((s) => (
          <span
            key={s.stage}
            className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm"
          >
            {STAGE_LABELS[s.stage] || s.stage}: {s.correctCount}/{s.maxCount} · +{s.points}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BracketLeaderboardList({ entries, userId }) {
  if (!entries.length) {
    return <p className="text-center text-sm text-gray-500">No knock-out points yet</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isMe = entry.userId === userId;
        return (
          <div
            key={entry.userId}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              isMe
                ? 'border-[#FF6D00]/50 bg-[#FF6D00]/10'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                entry.rank === 1
                  ? 'bg-[#FF6D00] text-white'
                  : 'border-2 border-[#FF6D00] text-[#FF6D00]'
              }`}
            >
              {entry.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{entry.displayName}</p>
              <p className="text-xs text-gray-400">{entry.maskedPhone}</p>
            </div>
            <span className="text-lg font-bold text-[#FF6D00]">{entry.bracketPoints}</span>
          </div>
        );
      })}
    </div>
  );
}
