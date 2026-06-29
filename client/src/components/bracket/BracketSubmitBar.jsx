export default function BracketSubmitBar({
  pickCount,
  totalPicks,
  predictionsEnabled,
  locked,
  saving,
  onSave,
  onSubmit,
}) {
  const complete = pickCount >= totalPicks;

  return (
    <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Progress: <span className="font-semibold text-[#FF6D00]">{pickCount}/{totalPicks}</span>
        </span>
        {locked && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            Locked
          </span>
        )}
      </div>
      {/* {!locked && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving || !predictionsEnabled || pickCount === 0}
            onClick={onSave}
            className="flex-1 rounded-lg border border-[#FF6D00] py-2 text-sm font-semibold text-[#FF6D00] disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save draft'}
          </button>
          <button
            type="button"
            disabled={saving || !predictionsEnabled || !complete}
            onClick={onSubmit}
            className="flex-1 rounded-lg bg-[#FF6D00] py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {saving ? 'Submitting...' : 'Submit knock-out'}
          </button>
        </div>
      )} */}
      {!predictionsEnabled && !locked && (
        <p className="mt-2 text-center text-xs text-gray-500">
          Waiting for all Round of 32 teams to be set
        </p>
      )}
    </div>
  );
}
