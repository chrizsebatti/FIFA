export default function BracketSubmitConfirm({
  pickCount,
  totalPicks,
  saving,
  onConfirm,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bracket-submit-title"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-gradient-to-b from-[#FF6D00]/15 to-white px-5 pb-4 pt-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6D00]/15 text-2xl">
            🏆
          </div>
          <h3 id="bracket-submit-title" className="text-lg font-bold text-gray-900">
            Lock in your knock-out?
          </h3>
          <p className="mt-1 text-sm text-gray-500">This cannot be undone after you submit.</p>
        </div>

        <div className="space-y-2 px-5 pb-5">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-[#FF6D00]">{pickCount}/{totalPicks}</span>{' '}
              picks ready
            </p>
            <ul className="mt-2 space-y-1 text-xs text-gray-500">
              <li>· Your full knock-out path will be saved</li>
              <li>· You won&apos;t be able to edit picks later</li>
              <li>· Points are awarded stage by stage (+10 per correct team)</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 disabled:opacity-50"
            >
              Go back
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-[#FF6D00] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit knock-out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
