function pointsLabel(points, finished) {
  if (!finished) return '—';
  if (points > 0) return `+${points}`;
  return '0';
}

function pointsClassName(points, finished) {
  if (!finished) return 'text-gray-400';
  if (points === 100) return 'font-bold text-[#FF6D00]';
  if (points === 50) return 'font-bold text-[#008631]';
  return 'text-gray-400';
}

export default function LeaderboardPointsHistory({ loading, history }) {
  if (loading) {
    return (
      <div className="space-y-2 px-4 py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between gap-3">
            <div className="h-3 flex-1 rounded skeleton-shimmer" />
            <div className="h-3 w-8 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (!history?.length) {
    return (
      <p className="px-4 py-3 text-xs text-gray-500">No predictions yet</p>
    );
  }

  return (
    <div className="max-h-48 space-y-1 overflow-y-auto px-4 py-3">
      {history.map((item) => {
        const finished = item.match?.status === 'finished';
        const label = item.match
          ? `${item.match.teamA} vs ${item.match.teamB}`
          : 'Match removed';

        return (
          <div
            key={item.predictionId}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <p className="min-w-0 truncate text-gray-600">{label}</p>
            <span
              className={`shrink-0 tabular-nums ${pointsClassName(item.pointsEarned, finished)}`}
            >
              {pointsLabel(item.pointsEarned, finished)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
