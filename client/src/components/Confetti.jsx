import { useMemo } from 'react';

const COLORS = ['#f5c518', '#00a651', '#ffffff', '#ff6b6b', '#4ecdc4'];

function createPieces(count = 36) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${-(Math.random() * 5)}s`,
    duration: `${3 + Math.random() * 2}s`,
    color: COLORS[i % COLORS.length],
    width: `${3 + Math.random() * 4}px`,
    height: `${5 + Math.random() * 7}px`,
    rotation: `${Math.random() * 360}deg`,
  }));
}

export default function Confetti({ active = true }) {
  const pieces = useMemo(() => createPieces(), []);

  if (!active) return null;

  return (
    <div className="confetti-container pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece absolute top-0 block rounded-sm"
          style={{
            left: piece.left,
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotation})`,
          }}
        />
      ))}
    </div>
  );
}
