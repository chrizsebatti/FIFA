import MatchCardSkeleton from './MatchCardSkeleton';

export default function MyPredictionsLoader({ count = 3 }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-label="Loading predictions">
      {Array.from({ length: count }, (_, i) => (
        <MatchCardSkeleton key={i} showPrediction />
      ))}
    </div>
  );
}
