import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import TeamEmojiBadge from '../components/TeamEmojiBadge';

export default function FanShed() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/stats/fans')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load fan stats'))
      .finally(() => setLoading(false));
  }, []);

  const fanShedLayout = (content) => (
    <Layout hideHeader banner="/assets/banner.png" theme="dark">
      {content}
    </Layout>
  );

  if (loading) {
    return fanShedLayout(<p className="text-gray-400">Loading...</p>);
  }

  if (error || !data) {
    return fanShedLayout(<p className="text-red-400">{error || 'Failed to load'}</p>);
  }

  const { teams, assignedFans, unassignedFans, totalUsers, userFavoriteTeamId } = data;
  const userTeam = teams.find((t) => t._id === userFavoriteTeamId);

  return fanShedLayout(
    <>
      <h2 className="mb-1 text-xl font-bold text-white">Fan Shed</h2>
      <p className="mb-4 text-sm text-gray-400">
        Total fans per team based on Profile favorite picks
      </p>

      {!userFavoriteTeamId && (
        <div className="mb-4 rounded-xl border border-[#FF6D00]/30 bg-[#FF6D00]/10 px-4 py-3 text-sm">
          <p className="text-gray-300">
            Set your favorite team on{' '}
            <Link to="/profile" className="font-semibold text-[#FF6D00] hover:underline">
              Profile
            </Link>{' '}
            to join the shed
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { value: assignedFans, label: 'Fans assigned' },
          { value: teams.length, label: 'Teams' },
          { value: unassignedFans, label: 'No team yet' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-800 bg-gray-900/70 p-3 text-center backdrop-blur-sm"
          >
            <p className="text-xl font-bold text-[#FF6D00]">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {userTeam && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 backdrop-blur-sm"
          style={{
            borderColor: `${userTeam.color}60`,
            backgroundColor: `${userTeam.color}18`,
          }}
        >
          <p className="text-xs text-gray-500">Your team</p>
          <p className="flex items-center gap-2 font-semibold" style={{ color: userTeam.color }}>
            {userTeam.emoji && <span className="text-xl">{userTeam.emoji}</span>}
            {userTeam.name} · {userTeam.fanCount} fan{userTeam.fanCount !== 1 ? 's' : ''} (
            {userTeam.percentage}%)
          </p>
        </div>
      )}

      {teams.length === 0 ? (
        <p className="text-gray-500">No teams added yet. Ask an admin to add teams.</p>
      ) : (
        <>
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-300">Rankings</h3>
            {assignedFans === 0 && (
              <p className="mb-3 text-sm text-gray-500">
                No fans assigned yet — be the first to pick a team on Profile
              </p>
            )}
            <div className="space-y-2">
              {teams.map((team, index) => {
                const isUserTeam = team._id === userFavoriteTeamId;
                const teamColor = team.color || '#FF6D00';
                return (
                  <div
                    key={team._id}
                    className={`rounded-xl border px-4 py-3 backdrop-blur-sm ${
                      isUserTeam ? '' : 'border-gray-800 bg-gray-900/60'
                    }`}
                    style={
                      isUserTeam
                        ? {
                            borderColor: `${teamColor}70`,
                            backgroundColor: `${teamColor}20`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      <TeamEmojiBadge
                        emoji={team.emoji}
                        photo={team.photo}
                        rank={index + 1}
                        color={teamColor}
                        dark
                      />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-medium text-gray-100">
                          <span
                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: teamColor }}
                          />
                          {team.name}
                          {isUserTeam && (
                            <span className="text-xs" style={{ color: teamColor }}>
                              (you)
                            </span>
                          )}
                        </p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${assignedFans ? team.percentage : 0}%`,
                              backgroundColor: teamColor,
                            }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold" style={{ color: teamColor }}>
                          {team.fanCount}
                        </p>
                        <p className="text-xs text-gray-500">{team.percentage}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {totalUsers > 0 && (
            <p className="mt-4 text-center text-xs text-gray-600">
              {totalUsers} total user{totalUsers !== 1 ? 's' : ''} in the pool
            </p>
          )}
        </>
      )}
    </>
  );
}
