export default function MatchDetailLoader() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading match">
      <div className="mb-4 h-4 w-12 rounded skeleton-shimmer" />

      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <div className="mx-auto mb-3 h-3 w-24 rounded skeleton-shimmer" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full skeleton-shimmer" />
            <div className="h-5 w-20 rounded skeleton-shimmer" />
          </div>
          <div className="h-4 w-6 rounded skeleton-shimmer" />
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full skeleton-shimmer" />
            <div className="h-5 w-20 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="mx-auto mt-4 h-16 w-full max-w-xs rounded-xl skeleton-shimmer" />
        <div className="mx-auto mt-3 h-3 w-36 rounded skeleton-shimmer" />
        <div className="mx-auto mt-2 h-6 w-20 rounded-full skeleton-shimmer" />
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 h-3 w-full rounded skeleton-shimmer" />
          <div className="flex h-4 gap-1 overflow-hidden rounded-full">
            <div className="w-1/3 skeleton-shimmer" />
            <div className="w-1/3 skeleton-shimmer" />
            <div className="w-1/3 skeleton-shimmer" />
          </div>
        </div>

        <div>
          <div className="mx-auto mb-3 h-4 w-40 rounded skeleton-shimmer" />
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-24 flex-1 rounded-xl skeleton-shimmer" />
              <div className="h-8 w-8 rounded skeleton-shimmer" />
              <div className="h-24 flex-1 rounded-xl skeleton-shimmer" />
            </div>
            <div className="mx-auto mt-4 h-10 w-28 rounded-xl skeleton-shimmer" />
          </div>
        </div>

        <div className="h-12 w-full rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}
