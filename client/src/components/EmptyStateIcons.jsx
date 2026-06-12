export function NoMatchesInProgressIcon({ className = 'h-36 w-36' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="28"
        y="44"
        width="104"
        height="72"
        rx="8"
        stroke="#E5E7EB"
        strokeWidth="2.5"
      />
      <line x1="80" y1="44" x2="80" y2="116" stroke="#E5E7EB" strokeWidth="2" />
      <circle cx="80" cy="80" r="14" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="28" y="62" width="18" height="36" rx="2" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="114" y="62" width="18" height="36" rx="2" stroke="#E5E7EB" strokeWidth="2" />
    </svg>
  );
}
