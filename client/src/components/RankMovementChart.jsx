import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import RankArrow from './RankArrow';

function matchLabel(match) {
  if (!match) return '';
  return `${match.teamA} vs ${match.teamB}`;
}

export default function RankMovementChart({ rankHistory }) {
  if (!rankHistory?.length) {
    return <p className="text-sm text-gray-500">No rank history yet. History updates after each match is scored.</p>;
  }

  const chartData = rankHistory.map((entry, index) => ({
    name: matchLabel(entry.match),
    rank: entry.rank,
    shortName: `#${index + 1}`,
  }));

  const maxRank = Math.max(...chartData.map((d) => d.rank), 1);

  return (
    <div className="space-y-4">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis
              dataKey="shortName"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              reversed
              domain={[1, maxRank + 1]}
              allowDecimals={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#111827',
              }}
              formatter={(value) => [`#${value}`, 'Rank']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
            />
            <Line
              type="monotone"
              dataKey="rank"
              stroke="#FF6D00"
              strokeWidth={2}
              dot={{ fill: '#FF6D00', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {rankHistory.map((entry) => (
          <div
            key={entry.match._id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{matchLabel(entry.match)}</p>
              {entry.match.stage && (
                <p className="text-xs text-gray-400">{entry.match.stage}</p>
              )}
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className="font-bold text-fifa-primary">#{entry.rank}</span>
              <RankArrow change={entry.rankChange} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
