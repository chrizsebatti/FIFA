function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="h-8 w-8 shrink-0 rounded-full skeleton-shimmer" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-32 rounded skeleton-shimmer" />
        <div className="h-3 w-24 rounded skeleton-shimmer" />
      </div>
      <div className="h-6 w-10 shrink-0 rounded skeleton-shimmer" />
    </div>
  );
}

export default function LeaderboardLoader({ count = 6 }) {
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-label="Loading leaderboard">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
