import { getPhotoUrl } from '../utils/teamPhoto';

export default function TeamEmojiBadge({
  emoji,
  photo,
  rank,
  color = '#FF6D00',
  size = 'md',
  dark = false,
}) {
  const sizeClass = size === 'lg' ? 'h-10 w-10 text-xl' : 'h-8 w-8 text-lg';
  const photoUrl = getPhotoUrl(photo);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={`shrink-0 rounded-full border object-cover ${sizeClass} ${
          dark ? 'border-gray-700' : 'border-gray-200'
        }`}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border ${sizeClass} ${
        emoji
          ? dark
            ? 'bg-gray-900'
            : 'bg-white'
          : 'text-sm font-bold text-white'
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
