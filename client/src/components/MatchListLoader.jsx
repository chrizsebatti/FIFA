import MatchCardSkeleton from './MatchCardSkeleton';

export default function MatchListLoader({ count = 3 }) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center text-center"
      role="status"
      aria-live="polite"
      aria-label="Loading matches"
    >
      <div className="flex flex-col items-center">
        <div className="relative mb-1">
          <div className="loader-ball-shadow absolute bottom-0 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-gray-300 blur-sm" />
          <div className="loader-ball relative flex h-12 w-12 items-center justify-center text-4xl">
            ⚽
          </div>
        </div>
        <p className="text-center text-sm font-medium text-gray-500">Fetching fixtures</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="loader-dot h-1.5 w-1.5 rounded-full bg-[#E65100]" />
          <span className="loader-dot h-1.5 w-1.5 rounded-full bg-[#FF6D00]" />
          <span className="loader-dot h-1.5 w-1.5 rounded-full bg-[#FFAB66]" />
        </div>
      </div>

      {/* <div className="space-y-3">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div> */}
    </div>
  );
}
