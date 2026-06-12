export default function RankArrow({ change, className = '' }) {
  if (change == null) return null;

  if (change > 0) {
    return <span className={`text-green-600 ${className}`}>▲ {change}</span>;
  }
  if (change < 0) {
    return <span className={`text-red-600 ${className}`}>▼ {Math.abs(change)}</span>;
  }
  return <span className={`text-gray-400 ${className}`}>—</span>;
}
