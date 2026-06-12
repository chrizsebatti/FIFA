import { useEffect, useRef, useState } from 'react';

const MIN_DURATION_MS = 1400;

export default function FootballLoader({ show = true }) {
  const [visible, setVisible] = useState(show);
  const shownAt = useRef(Date.now());

  useEffect(() => {
    if (show) {
      shownAt.current = Date.now();
      setVisible(true);
      return;
    }

    const elapsed = Date.now() - shownAt.current;
    const remaining = Math.max(0, MIN_DURATION_MS - elapsed);
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="loader-glow pointer-events-none absolute h-64 w-64 rounded-full bg-fifa-primary/15 blur-3xl" />

      <div className="relative mb-8">
        <div className="loader-ball-shadow absolute bottom-0 left-1/2 h-3 w-16 -translate-x-1/2 rounded-full bg-gray-300 blur-sm" />
        <div className="loader-ball relative flex h-20 w-20 items-center justify-center text-6xl">
          ⚽
        </div>
      </div>

      <h1 className="mb-1 text-center text-2xl font-bold tracking-wide text-fifa-primary">
        FIFA WORLD CUP 2026
      </h1>
      <p className="mb-6 text-sm font-medium uppercase tracking-widest text-gray-500">
        TEAM SOCCER&apos;S PREDICTION
      </p>

      <div className="flex items-center gap-2">
        <span className="loader-dot h-2 w-2 rounded-full bg-[#E65100]" />
        <span className="loader-dot h-2 w-2 rounded-full bg-[#FF6D00]" />
        <span className="loader-dot h-2 w-2 rounded-full bg-[#FFAB66]" />
      </div>

      <p className="mt-5 text-xs uppercase tracking-widest text-gray-400">Loading</p>
    </div>
  );
}
