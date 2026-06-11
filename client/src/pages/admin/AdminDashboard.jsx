import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { formatDateTime } from '../../utils/format';

const TABS = ['matches', 'predictions', 'users'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ teamA: '', teamB: '', startTime: '', stage: '' });
  const [resultForm, setResultForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const loadData = async () => {
    try {
      const [m, p, u] = await Promise.all([
        api.get('/admin/matches'),
        api.get('/admin/predictions'),
        api.get('/admin/users'),
      ]);
      setMatches(m.data.matches);
      setPredictions(p.data.predictions);
      setUsers(u.data.users);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [navigate]);

  const createMatch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/admin/matches', form);
      setForm({ teamA: '', teamB: '', startTime: '', stage: '' });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const enterResult = async (matchId) => {
    const { scoreA, scoreB } = resultForm[matchId] || {};
    if (scoreA == null || scoreB == null) return;
    setLoading(true);
    try {
      await api.put(`/admin/matches/${matchId}`, {
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
      });
      setResultForm((prev) => ({ ...prev, [matchId]: undefined }));
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save result');
    } finally {
      setLoading(false);
    }
  };

  const deleteMatch = async (matchId) => {
    if (!confirm('Delete this match and all predictions?')) return;
    await api.delete(`/admin/matches/${matchId}`);
    await loadData();
  };

  return (
    <div className="min-h-dvh bg-fifa-dark">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-fifa-dark px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-bold text-fifa-gold">Admin Dashboard</h1>
          <button onClick={logout} className="text-sm text-white/50 hover:text-white">
            Logout
          </button>
        </div>
        <div className="mx-auto mt-3 flex max-w-2xl gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm capitalize ${
                tab === t ? 'bg-fifa-gold text-black font-semibold' : 'bg-white/5 text-white/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {tab === 'matches' && (
          <div className="space-y-6">
            <form onSubmit={createMatch} className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <h2 className="font-semibold">Add Match</h2>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Team A"
                  required
                  value={form.teamA}
                  onChange={(e) => setForm({ ...form, teamA: e.target.value })}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                />
                <input
                  placeholder="Team B"
                  required
                  value={form.teamB}
                  onChange={(e) => setForm({ ...form, teamB: e.target.value })}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                />
              </div>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              />
              <input
                placeholder="Stage (e.g. Group A)"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-fifa-green py-2 text-sm font-semibold disabled:opacity-50"
              >
                Add Match
              </button>
            </form>

            <div className="space-y-3">
              {matches.map((match) => (
                <div key={match._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-fifa-gold">{match.stage || 'Match'}</p>
                      <p className="font-semibold">
                        {match.teamA} vs {match.teamB}
                      </p>
                      <p className="text-xs text-white/50">{formatDateTime(match.startTime)}</p>
                      {match.status === 'finished' && (
                        <p className="mt-1 text-sm">
                          Result: {match.scoreA}-{match.scoreB} (Winner: {match.winner})
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMatch(match._id)}
                      className="text-xs text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                  {match.status !== 'finished' && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="A"
                        value={resultForm[match._id]?.scoreA ?? ''}
                        onChange={(e) =>
                          setResultForm((prev) => ({
                            ...prev,
                            [match._id]: { ...prev[match._id], scoreA: e.target.value },
                          }))
                        }
                        className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-sm"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="B"
                        value={resultForm[match._id]?.scoreB ?? ''}
                        onChange={(e) =>
                          setResultForm((prev) => ({
                            ...prev,
                            [match._id]: { ...prev[match._id], scoreB: e.target.value },
                          }))
                        }
                        className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => enterResult(match._id)}
                        className="rounded bg-fifa-gold px-3 py-1 text-xs font-semibold text-black"
                      >
                        Save Result
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'predictions' && (
          <div className="space-y-2">
            {predictions.length === 0 && (
              <p className="text-white/50">No predictions yet</p>
            )}
            {predictions.map((p) => (
              <div key={p._id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <p className="font-medium">
                  {p.user?.displayName || p.user?.phoneNumber}
                </p>
                <p className="text-white/50">
                  {p.match?.teamA} vs {p.match?.teamB}
                </p>
                <p>
                  Pick: {p.predictedWinner} ({p.scoreA}-{p.scoreB}) · {p.pointsEarned} pts
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-2">
            {users.map((u, i) => (
              <div
                key={u._id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div>
                  <p className="font-medium">{u.displayName || u.phoneNumber}</p>
                  <p className="text-xs text-white/50">{u.phoneNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-fifa-gold">{u.totalPoints} pts</p>
                  <p className="text-xs text-white/40">#{i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
