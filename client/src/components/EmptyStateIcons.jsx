export function NoUpcomingMatchesIcon({ className = 'h-36 w-36' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="40" y="48" width="80" height="72" rx="8" stroke="#E5E7EB" strokeWidth="2.5" />
      <path d="M56 48v-12M104 48v-12" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 68h80" stroke="#E5E7EB" strokeWidth="2" />

      <circle cx="64" cy="88" r="3" fill="#E5E7EB" />
      <circle cx="80" cy="88" r="3" fill="#E5E7EB" />
      <circle cx="96" cy="88" r="3" fill="#E5E7EB" />
      <circle cx="64" cy="104" r="3" fill="#E5E7EB" />
      <circle cx="80" cy="104" r="3" fill="#FF6D00" fillOpacity="0.85" />
      <circle cx="96" cy="104" r="3" fill="#E5E7EB" />

      <circle cx="112" cy="112" r="18" stroke="#FF6D00" strokeWidth="2" strokeOpacity="0.35" />
      <circle cx="112" cy="112" r="12" stroke="#FF6D00" strokeWidth="2" />
      <path d="M112 106v6l4 3" stroke="#FF6D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
