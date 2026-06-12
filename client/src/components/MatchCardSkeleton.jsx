export default function MatchCardSkeleton({ showPrediction = false }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="mb-3 h-3 w-20 rounded skeleton-shimmer" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="h-4 w-24 rounded skeleton-shimmer" />
            <div className="h-7 w-8 rounded skeleton-shimmer" />
          </div>
          <div className="h-3 w-6 rounded skeleton-shimmer" />
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="h-4 w-24 rounded skeleton-shimmer" />
            <div className="h-7 w-8 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="h-3 w-28 rounded skeleton-shimmer" />
          <div className="h-5 w-16 rounded-full skeleton-shimmer" />
        </div>
      </div>

      {showPrediction && (
        <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-3">
          <div className="mb-2 h-2.5 w-14 rounded skeleton-shimmer" />
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded skeleton-shimmer" />
              <div className="h-3 w-32 rounded skeleton-shimmer" />
            </div>
            <div className="h-6 w-16 rounded-full skeleton-shimmer" />
          </div>
        </div>
      )}
    </div>
  );
}
