import { useEffect, useState } from 'react';

function getTimeLeft(startTime) {
  return Math.max(0, new Date(startTime).getTime() - Date.now());
}

function splitCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function TimeBlock({ value, label, size }) {
  const isCompact = size === 'compact';
  return (
    <div className="flex flex-col items-center">
      <div
        className={`countdown-block flex items-center justify-center rounded-xl border border-[#FF6D00]/25 bg-gradient-to-b from-[#FF6D00]/10 to-white font-bold tabular-nums text-gray-900 shadow-sm ${
          isCompact ? 'h-10 min-w-[2.5rem] px-1.5 text-lg' : 'h-14 min-w-[3.25rem] px-2 text-2xl'
        }`}
      >
        {pad(value)}
      </div>
      <span
        className={`mt-1 font-semibold uppercase tracking-wider text-[#FF6D00] ${
          isCompact ? 'text-[8px]' : 'text-[10px]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Separator({ size }) {
  return (
    <span
      className={`countdown-separator self-start font-bold text-[#FF6D00]/60 ${
        size === 'compact' ? 'mt-2 text-lg' : 'mt-4 text-2xl'
      }`}
      aria-hidden="true"
    >
      :
    </span>
  );
}

export default function MatchCountdown({
  startTime,
  isFinished = false,
  isLive = false,
  size = 'default',
  className = '',
  onClick,
}) {
  const clickable = Boolean(onClick);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(startTime));

  useEffect(() => {
    if (isFinished || isLive) return undefined;

    const tick = () => setTimeLeft(getTimeLeft(startTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime, isFinished, isLive]);

  if (isFinished) return null;

  const interactiveClass = clickable
    ? 'cursor-pointer rounded-xl transition active:scale-[0.98] hover:bg-[#FF6D00]/5'
    : '';

  if (isLive || timeLeft <= 0) {
    const liveBadge = (
      <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-50 px-3 py-1.5">
        <span className="countdown-live-dot h-2 w-2 rounded-full bg-red-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">Live</span>
      </div>
    );

    if (!clickable) {
      return <div className={className}>{liveBadge}</div>;
    }

    return (
      <button type="button" onClick={onClick} className={`${interactiveClass} ${className}`}>
        {liveBadge}
      </button>
    );
  }

  const { hours, minutes, seconds, totalSeconds } = splitCountdown(timeLeft);
  const urgent = totalSeconds > 0 && totalSeconds <= 3600;

  const content = (
    <>
      {size !== 'compact' && (
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          Kickoff in
        </p>
      )}
      <div className="flex items-start justify-center gap-1.5 sm:gap-2">
        <TimeBlock value={hours} label="Hrs" size={size} />
        <Separator size={size} />
        <TimeBlock value={minutes} label="Min" size={size} />
        <Separator size={size} />
        <TimeBlock value={seconds} label="Sec" size={size} />
      </div>
      {/* {clickable && size !== 'compact' && (
        <p className="mt-3 text-center text-[10px] font-medium text-[#FF6D00]">
          Tap to make your pick ↓
        </p>
      )} */}
    </>
  );

  if (!clickable) {
    return (
      <div className={`${urgent ? 'countdown-urgent' : ''} ${className}`}>{content}</div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left ${urgent ? 'countdown-urgent' : ''} ${interactiveClass} ${className}`}
    >
      {content}
    </button>
  );
}
