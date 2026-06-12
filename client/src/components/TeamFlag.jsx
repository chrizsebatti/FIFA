const SIZE_CLASS = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

const FALLBACK_CLASS = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export default function TeamFlag({ emoji, name, size = 'md', className = '' }) {
  if (emoji) {
    return (
      <span className={`${SIZE_CLASS[size]} leading-none ${className}`} role="img" aria-label={name}>
        {emoji}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#FF6D00]/10 font-bold text-[#FF6D00] ${FALLBACK_CLASS[size]} ${className}`}
      aria-hidden="true"
    >
      {name?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
}
