export function EditIcon({ className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.832 18.457a2 2 0 0 1-.878.513l-3.386.847a.5.5 0 0 1-.604-.604l.847-3.386a2 2 0 0 1 .513-.878L16.862 4.487Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.25 6.1 2.65 2.65" />
    </svg>
  );
}

export function DeleteIcon({ className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 6v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
    </svg>
  );
}
