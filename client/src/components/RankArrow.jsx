export default function RankArrow({ change, className = '' }) {
  if (change == null) return null;

  if (change > 0) {
    return <span className={`text-green-400 ${className}`}>▲ {change}</span>;
  }
  if (change < 0) {
    return <span className={`text-red-400 ${className}`}>▼ {Math.abs(change)}</span>;
  }
  return <span className={`text-white/40 ${className}`}>—</span>;
}
