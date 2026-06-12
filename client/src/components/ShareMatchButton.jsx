import { useState } from 'react';
import { shareMatch } from '../utils/share';

function ShareIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M18 4a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM6 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM18 20a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShareMatchButton({ match, className = '' }) {
  const [status, setStatus] = useState('');

  const handleShare = async () => {
    try {
      const result = await shareMatch(match);
      if (result === 'cancelled') return;
      setStatus(result === 'shared' ? 'shared' : 'copied');
      setTimeout(() => setStatus(''), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const isSuccess = status === 'shared' || status === 'copied';
  const isError = status === 'error';

  const label = isSuccess
    ? status === 'shared'
      ? 'Shared'
      : 'Copied'
    : isError
      ? 'Share failed'
      : 'Share prediction link';

  return (
    <button
      type="button"
      onClick={handleShare}
      title={label}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow-sm transition active:scale-95 ${
        isSuccess
          ? 'border-[#008631]/40 text-[#008631]'
          : isError
            ? 'border-red-300 text-red-500'
            : 'border-[#FF6D00]/40 text-[#FF6D00] hover:border-[#FF6D00] hover:bg-[#FF6D00]/10'
      } ${className}`}
    >
      {isSuccess ? <CheckIcon className="h-3 w-3" /> : <ShareIcon className="h-3 w-3" />}
    </button>
  );
}
