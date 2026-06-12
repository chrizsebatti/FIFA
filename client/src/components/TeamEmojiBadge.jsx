export default function TeamEmojiBadge({ emoji, rank, color = '#FF6D00', size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-10 w-10 text-xl' : 'h-8 w-8 text-lg';

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border ${sizeClass} ${
        emoji ? 'bg-white' : 'text-sm font-bold text-white'
      }`}
      style={{
        borderColor: emoji ? `${color}60` : color,
        backgroundColor: emoji ? `${color}12` : color,
      }}
    >
      {emoji || rank}
    </span>
  );
}
