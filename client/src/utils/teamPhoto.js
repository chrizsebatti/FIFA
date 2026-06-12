export function getPhotoUrl(photoPath) {
  if (!photoPath) return '';
  if (photoPath.startsWith('http')) return photoPath;
  return photoPath;
}
