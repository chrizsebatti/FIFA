const VARIANT_CLASS = {
  orange: 'border-[#FF6D00]/40 text-[#FF6D00] hover:border-[#FF6D00] hover:bg-[#FF6D00]/10',
  red: 'border-red-300/60 text-red-500 hover:border-red-400 hover:bg-red-50',
  green: 'border-[#008631]/40 text-[#008631] hover:border-[#008631] hover:bg-[#008631]/10',
};

export function EditIcon({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DeleteIcon({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6h14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function IconActionButton({
  title,
  onClick,
  variant = 'orange',
  disabled = false,
  children,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow-sm transition active:scale-95 disabled:opacity-40 ${
        VARIANT_CLASS[variant] || VARIANT_CLASS.orange
      } ${className}`}
    >
      {children}
    </button>
  );
}
