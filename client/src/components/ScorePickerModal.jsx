import TeamFlag from './TeamFlag';

export default function ScorePickerModal({ teamName, teamEmoji, score, onChange, onClose }) {
  const value = Number(score) || 0;

  const adjust = (delta) => {
    onChange(String(Math.max(0, value + delta)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-picker-title"
      >
        <p id="score-picker-title" className="mb-6 text-center text-sm font-medium text-gray-500">
          Goals for
        </p>
        <div className="mb-8 flex flex-col items-center gap-2">
          <TeamFlag emoji={teamEmoji} name={teamName} size="lg" />
          <p className="text-center text-lg font-bold text-gray-900">{teamName}</p>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => adjust(-1)}
            disabled={value <= 0}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#FF6D00] text-2xl font-bold text-[#FF6D00] transition active:scale-95 disabled:opacity-30"
            aria-label="Decrease goals"
          >
            −
          </button>
          <span className="min-w-[4rem] text-center text-5xl font-bold tabular-nums text-gray-900">
            {value}
          </span>
          <button
            type="button"
            onClick={() => adjust(1)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6D00] text-2xl font-bold text-white transition active:scale-95"
            aria-label="Increase goals"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-[#FF6D00] py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
