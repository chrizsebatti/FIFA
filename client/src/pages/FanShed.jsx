import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import FanShedChart from '../components/FanShedChart';

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

  if (loading) {
    return (
      <Layout>
        <p className="text-white/50">Loading...</p>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <p className="text-red-400">{error || 'Failed to load'}</p>
      </Layout>
    );
  }

  const { teams, assignedFans, unassignedFans, totalUsers, userFavoriteTeamId } = data;
  const userTeam = teams.find((t) => t._id === userFavoriteTeamId);

  return (
    <Layout>
      <h2 className="mb-1 text-xl font-bold">Fan Shed</h2>
      <p className="mb-4 text-sm text-white/50">
        Total fans per team based on Profile favorite picks
      </p>

      {!userFavoriteTeamId && (
        <div className="mb-4 rounded-xl border border-fifa-gold/30 bg-fifa-gold/10 px-4 py-3 text-sm">
          <p className="text-white/80">
            Set your favorite team on{' '}
            <Link to="/profile" className="font-semibold text-fifa-gold hover:underline">
              Profile
            </Link>{' '}
            to join the shed
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="text-xl font-bold text-fifa-gold">{assignedFans}</p>
          <p className="mt-1 text-xs text-white/50">Fans assigned</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="text-xl font-bold text-fifa-gold">{teams.length}</p>
          <p className="mt-1 text-xs text-white/50">Teams</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="text-xl font-bold text-fifa-gold">{unassignedFans}</p>
          <p className="mt-1 text-xs text-white/50">No team yet</p>
        </div>
      </div>

      {userTeam && (
        <div className="mb-4 rounded-xl border border-fifa-gold/50 bg-fifa-gold/10 px-4 py-3">
          <p className="text-xs text-white/50">Your team</p>
          <p className="font-semibold text-fifa-gold">
            {userTeam.name} · {userTeam.fanCount} fan{userTeam.fanCount !== 1 ? 's' : ''} (
            {userTeam.percentage}%)
          </p>
        </div>
      )}

      {teams.length === 0 ? (
        <p className="text-white/50">No teams added yet. Ask an admin to add teams.</p>
      ) : (
        <>
          <section className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white/80">Fan distribution</h3>
            <FanShedChart teams={teams} userFavoriteTeamId={userFavoriteTeamId} />
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-white/80">Rankings</h3>
            {assignedFans === 0 && (
              <p className="mb-3 text-sm text-white/50">
                No fans assigned yet — be the first to pick a team on Profile
              </p>
            )}
            <div className="space-y-2">
              {teams.map((team, index) => {
                const isUserTeam = team._id === userFavoriteTeamId;
                return (
                  <div
                    key={team._id}
                    className={`rounded-xl border px-4 py-3 ${
                      isUserTeam
                        ? 'border-fifa-gold/50 bg-fifa-gold/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          index < 3 ? 'bg-fifa-gold text-black' : 'bg-white/10'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {team.name}
                          {isUserTeam && (
                            <span className="ml-2 text-xs text-fifa-gold">(you)</span>
                          )}
                        </p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${
                              isUserTeam ? 'bg-fifa-gold' : 'bg-fifa-green/70'
                            }`}
                            style={{
                              width: `${assignedFans ? team.percentage : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold text-fifa-gold">{team.fanCount}</p>
                        <p className="text-xs text-white/40">{team.percentage}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {totalUsers > 0 && (
            <p className="mt-4 text-center text-xs text-white/30">
              {totalUsers} total user{totalUsers !== 1 ? 's' : ''} in the pool
            </p>
          )}
        </>
      )}
    </Layout>
  );
}
