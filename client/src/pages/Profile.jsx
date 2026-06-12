import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import RankMovementChart from '../components/RankMovementChart';
import PredictionComparison from '../components/PredictionComparison';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState([]);
  const [teams, setTeams] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = async () => {
    const [profileRes, statsRes, teamsRes] = await Promise.all([
      api.get('/auth/me/profile'),
      api.get('/stats/predictions/me'),
      api.get('/teams'),
    ]);
    setProfile(profileRes.data);
    setStats(statsRes.data.stats);
    setTeams(teamsRes.data.teams);
    setDisplayName(profileRes.data.user.displayName || '');
    setFavoriteTeam(profileRes.data.user.favoriteTeam?._id || '');
  };

  useEffect(() => {
    loadProfile()
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.patch('/auth/me', {
        displayName,
        favoriteTeam: favoriteTeam || null,
      });
      setUser(res.data.user);
      setSuccess('Profile saved');
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-white/50">Loading...</p>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <p className="text-red-400">{error || 'Profile not found'}</p>
      </Layout>
    );
  }

  const { user, accuracy, rankHistory } = profile;

  return (
    <Layout>
      <h2 className="mb-4 text-xl font-bold">Profile</h2>

      <form onSubmit={handleSave} className="mb-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div>
          <label className="mb-1 block text-xs text-white/50">Profile Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-fifa-gold/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">Phone (cannot be changed)</label>
          <input
            value={user.phoneNumber}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/50 outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">Favorite Team</label>
          <select
            value={favoriteTeam}
            onChange={(e) => setFavoriteTeam(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-fifa-green">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-fifa-gold py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-fifa-gold">{accuracy}%</p>
          <p className="mt-1 text-xs text-white/50">Accuracy</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-fifa-gold">
            {user.currentRank ? `#${user.currentRank}` : '—'}
          </p>
          <p className="mt-1 text-xs text-white/50">Current Rank</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-fifa-gold">{user.totalPoints}</p>
          <p className="mt-1 text-xs text-white/50">Points</p>
        </div>
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">Rank Movement</h3>
        <RankMovementChart rankHistory={rankHistory} />
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Prediction Statistics</h3>
        <p className="mb-3 text-xs text-white/50">
          See how your picks compare to other users for each match
        </p>
        <PredictionComparison stats={stats} />
      </section>
    </Layout>
  );
}
