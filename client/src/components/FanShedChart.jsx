import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function FanShedChart({ teams, userFavoriteTeamId }) {
  if (!teams?.length) return null;

  const chartData = teams.map((team) => ({
    name: team.name.length > 10 ? `${team.name.slice(0, 9)}…` : team.name,
    fullName: team.name,
    fans: team.fanCount,
    color: team.color || '#FF6D00',
    isUserTeam: team._id === userFavoriteTeamId,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={50}
          />
          <YAxis
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
            formatter={(value) => [value, 'Fans']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
          />
          <Bar
            dataKey="fans"
            radius={[4, 4, 0, 0]}
            shape={(props) => {
              const { x, y, width, height, payload } = props;
              const fill = payload.color || '#FF6D00';
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={fill}
                  rx={4}
                  ry={4}
                  // stroke={payload.isUserTeam ? '#111827' : 'none'}
                  strokeWidth={payload.isUserTeam ? 2 : 0}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
