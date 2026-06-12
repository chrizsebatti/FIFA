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
    isUserTeam: team._id === userFavoriteTeamId,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={50}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => [value, 'Fans']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
          />
          <Bar
            dataKey="fans"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            shape={(props) => {
              const { x, y, width, height, payload } = props;
              const fill = payload.isUserTeam ? '#d4af37' : '#22c55e';
              return (
                <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
