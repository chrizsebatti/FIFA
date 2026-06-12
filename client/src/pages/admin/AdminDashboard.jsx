import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import DateTimeInput from '../../components/DateTimeInput';
import IconActionButton, { DeleteIcon, EditIcon } from '../../components/IconActionButton';
import ShareMatchButton from '../../components/ShareMatchButton';
import { formatDateTime, isoToDatetimeLocal, localDatetimeToISO } from '../../utils/format';

const TABS = ['matches', 'teams', 'predictions', 'customers'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#FF6D00');
  const [teamEmoji, setTeamEmoji] = useState('');
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamColor, setEditTeamColor] = useState('#FF6D00');
  const [editTeamEmoji, setEditTeamEmoji] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [form, setForm] = useState({ teamA: '', teamB: '', startTime: '', stage: '' });
  const [resultForm, setResultForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showPredictionImport, setShowPredictionImport] = useState(false);
  const [predictionImportResult, setPredictionImportResult] = useState(null);

  const SAMPLE_CSV = `teamA,teamB,startTime,stage,scoreA,scoreB
Brazil,Argentina,2026-06-15T11:30:00.000Z,Group A,2,1
Germany,France,2026-06-20T18:00:00.000Z,Group B,,`;

  const SAMPLE_JSON = `[
  {
    "teamA": "Brazil",
    "teamB": "Argentina",
    "startTime": "2026-06-15T11:30:00.000Z",
    "stage": "Group A",
    "scoreA": 2,
    "scoreB": 1
  },
  {
    "teamA": "Germany",
    "teamB": "France",
    "startTime": "2026-06-20T18:00:00.000Z",
    "stage": "Group B"
  }
]`;

  const SAMPLE_PREDICTIONS_CSV = `phoneNumber,displayName,matchId,predictedWinner,scoreA,scoreB
9876543210,John,PASTE_MATCH_ID_FROM_MATCHES_TAB,Brazil,2,1
9876543211,Jane,PASTE_MATCH_ID_FROM_MATCHES_TAB,Argentina,0,2`;

  const SAMPLE_PREDICTIONS_JSON = `[
  {
    "phoneNumber": "9876543210",
    "displayName": "John",
    "matchId": "PASTE_MATCH_ID_FROM_MATCHES_TAB",
    "predictedWinner": "Brazil",
    "scoreA": 2,
    "scoreB": 1
  }
]`;

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const loadData = async () => {
    try {
      const [m, p, s, t] = await Promise.all([
        api.get('/admin/matches'),
        api.get('/admin/predictions'),
        api.get('/admin/users/statistics'),
        api.get('/admin/teams'),
      ]);
      setMatches(m.data.matches);
      setPredictions(p.data.predictions);
      setStatistics(s.data.statistics);
      setTeams(t.data.teams);
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
      await api.post('/admin/matches', {
        ...form,
        startTime: localDatetimeToISO(form.startTime),
      });
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

  const startEdit = (match) => {
    setEditingId(match._id);
    setEditForm({
      teamA: match.teamA,
      teamB: match.teamB,
      startTime: isoToDatetimeLocal(match.startTime),
      stage: match.stage || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleBulkImport = async (file) => {
    setError('');
    setImportResult(null);
    setLoading(true);
    try {
      const text = await file.text();
      const isJson = file.name.toLowerCase().endsWith('.json');
      const format = isJson ? 'json' : 'csv';
      let data = text;
      if (isJson) {
        data = JSON.parse(text);
      }
      const res = await api.post('/admin/matches/bulk', { format, data });
      setImportResult(res.data);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionBulkImport = async (file) => {
    setError('');
    setPredictionImportResult(null);
    setLoading(true);
    try {
      const text = await file.text();
      const isJson = file.name.toLowerCase().endsWith('.json');
      const format = isJson ? 'json' : 'csv';
      const data = isJson ? JSON.parse(text) : text;
      const res = await api.post('/admin/predictions/bulk', { format, data });
      setPredictionImportResult(res.data);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Prediction import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const createTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/admin/teams', {
        name: teamName.trim(),
        color: teamColor,
        emoji: teamEmoji.trim(),
      });
      setTeamName('');
      setTeamColor('#FF6D00');
      setTeamEmoji('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const saveTeamEdit = async (teamId) => {
    if (!editTeamName.trim()) return;
    setLoading(true);
    try {
      await api.put(`/admin/teams/${teamId}`, {
        name: editTeamName.trim(),
        color: editTeamColor,
        emoji: editTeamEmoji.trim(),
      });
      setEditingTeamId(null);
      setEditTeamName('');
      setEditTeamColor('#FF6D00');
      setEditTeamEmoji('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamActive = async (team) => {
    setLoading(true);
    try {
      await api.put(`/admin/teams/${team._id}`, { isActive: !team.isActive });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const activeTeams = teams.filter((t) => t.isActive);

  const saveEdit = async (matchId) => {
    setError('');
    setLoading(true);
    try {
      await api.put(`/admin/matches/${matchId}`, {
        teamA: editForm.teamA,
        teamB: editForm.teamB,
        startTime: localDatetimeToISO(editForm.startTime),
        stage: editForm.stage,
      });
      cancelEdit();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-10 border-b border-[#FF6D00]/25 bg-gradient-to-b from-[#FF6D00]/15 via-[#FF6D00]/8 to-white px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#FF6D00]">Admin Dashboard</h1>
            <p className="text-xs text-gray-600">FIFA WC 2026</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-white/60 px-2.5 py-1 text-xs text-gray-600 shadow-sm hover:bg-white hover:text-[#FF6D00]"
          >
            Logout
          </button>
        </div>
        <div className="mx-auto mt-3 flex max-w-2xl gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm capitalize transition-colors ${
                tab === t
                  ? 'bg-[#FF6D00] font-semibold text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
            <form onSubmit={createMatch} className="min-w-0 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h2 className="font-semibold">Add Match</h2>
              <div className="grid grid-cols-2 gap-2">
                {activeTeams.length > 0 ? (
                  <>
                    <select
                      required
                      value={form.teamA}
                      onChange={(e) => setForm({ ...form, teamA: e.target.value })}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                    >
                      <option value="">Team A</option>
                      {activeTeams.map((t) => (
                        <option key={t._id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      value={form.teamB}
                      onChange={(e) => setForm({ ...form, teamB: e.target.value })}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                    >
                      <option value="">Team B</option>
                      {activeTeams.map((t) => (
                        <option key={t._id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      placeholder="Team A"
                      required
                      value={form.teamA}
                      onChange={(e) => setForm({ ...form, teamA: e.target.value })}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                    />
                    <input
                      placeholder="Team B"
                      required
                      value={form.teamB}
                      onChange={(e) => setForm({ ...form, teamB: e.target.value })}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                    />
                  </>
                )}
              </div>
              <DateTimeInput
                required
                value={form.startTime}
                onChange={(startTime) => setForm({ ...form, startTime })}
              />
              <p className="text-xs text-gray-400">Date & time in your local timezone</p>
              <input
                placeholder="Stage (e.g. Group A)"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg border border-[#FF6D00] bg-white py-2 text-sm font-semibold text-[#FF6D00] transition hover:bg-[#FF6D00]/5 disabled:opacity-50"
              >
                Add Match
              </button>
            </form>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setShowImport(!showImport)}
                className="flex w-full items-center justify-between text-left"
              >
                <h2 className="font-semibold">Bulk Import (CSV / JSON)</h2>
                <span className="text-sm text-gray-400">{showImport ? '▲' : '▼'}</span>
              </button>

              {showImport && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-gray-500">
                    Import many matches at once. For past matches, include scoreA and scoreB —
                    they will be marked finished automatically.
                  </p>
                  <div className="rounded-lg bg-gray-100 p-3 text-xs text-gray-500">
                    <p className="font-medium text-gray-700">Required columns/fields:</p>
                    <p className="mt-1">teamA, teamB, startTime (ISO UTC e.g. 2026-06-15T11:30:00.000Z)</p>
                    <p className="mt-1">Optional: stage, scoreA, scoreB (both scores = past match)</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => downloadSample(SAMPLE_CSV, 'matches-sample.csv')}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-fifa-primary"
                    >
                      Download CSV sample
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSample(SAMPLE_JSON, 'matches-sample.json')}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-fifa-primary"
                    >
                      Download JSON sample
                    </button>
                  </div>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition hover:border-fifa-primary/50">
                    <span className="text-2xl">📁</span>
                    <span className="mt-2 text-sm font-medium">Choose CSV or JSON file</span>
                    <span className="mt-1 text-xs text-gray-400">.csv or .json</span>
                    <input
                      type="file"
                      accept=".csv,.json,application/json,text/csv"
                      className="hidden"
                      disabled={loading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBulkImport(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {importResult && (
                    <div className="rounded-lg bg-fifa-green/20 px-3 py-2 text-sm text-green-300">
                      Imported {importResult.imported} matches ({importResult.finished} finished,{' '}
                      {importResult.upcoming} upcoming)
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {matches.map((match) => (
                <div key={match._id} className="relative rounded-xl border border-gray-200 bg-gray-50 p-4">
                  {editingId !== match._id && (
                    <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
                      {match.status !== 'finished' && <ShareMatchButton match={match} />}
                      {match.status !== 'finished' && (
                        <IconActionButton title="Edit match" variant="orange" onClick={() => startEdit(match)}>
                          <EditIcon />
                        </IconActionButton>
                      )}
                      <IconActionButton
                        title="Delete match"
                        variant="red"
                        onClick={() => deleteMatch(match._id)}
                      >
                        <DeleteIcon />
                      </IconActionButton>
                    </div>
                  )}
                  {editingId === match._id ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-fifa-primary">Edit Match</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Team A"
                          required
                          value={editForm.teamA}
                          onChange={(e) => setEditForm({ ...editForm, teamA: e.target.value })}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                        />
                        <input
                          placeholder="Team B"
                          required
                          value={editForm.teamB}
                          onChange={(e) => setEditForm({ ...editForm, teamB: e.target.value })}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <DateTimeInput
                        required
                        value={editForm.startTime}
                        onChange={(startTime) => setEditForm({ ...editForm, startTime })}
                      />
                      <input
                        placeholder="Stage (e.g. Group A)"
                        value={editForm.stage}
                        onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(match._id)}
                          disabled={loading}
                          className="flex-1 rounded-lg bg-fifa-green py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="pr-24">
                        <p className="text-xs text-fifa-primary">{match.stage || 'Match'}</p>
                        <p className="font-semibold">
                          {match.teamA} vs {match.teamB}
                        </p>
                        <p className="text-xs text-gray-500">{formatDateTime(match.startTime)}</p>
                        <p className="mt-1 break-all text-[10px] text-gray-400">
                          ID: {match._id}
                        </p>
                        {match.status === 'finished' && (
                          <p className="mt-1 text-sm">
                            Result: {match.scoreA}-{match.scoreB} (Winner: {match.winner})
                          </p>
                        )}
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
                            className="w-16 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm"
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
                            className="w-16 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => enterResult(match._id)}
                            className="rounded bg-fifa-primary px-3 py-1 text-xs font-semibold text-white"
                          >
                            Save Result
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'teams' && (
          <div className="space-y-6">
            <form onSubmit={createTeam} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h2 className="font-semibold">Add Team</h2>
              <input
                placeholder="Team name (e.g. Brazil)"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
              />
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Flag / emoji</label>
                <input
                  placeholder="🇧🇷"
                  value={teamEmoji}
                  onChange={(e) => setTeamEmoji(e.target.value)}
                  className="w-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-xl outline-none"
                  maxLength={8}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Team color</label>
                <input
                  type="color"
                  value={teamColor}
                  onChange={(e) => setTeamColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-200 bg-white"
                />
                <span className="text-xs text-gray-400">{teamColor}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-fifa-green py-2 text-sm font-semibold disabled:opacity-50"
              >
                Add Team
              </button>
            </form>

            <div className="space-y-2">
              {teams.length === 0 && <p className="text-gray-500">No teams yet</p>}
              {teams.map((team) => (
                <div
                  key={team._id}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                    team.isActive ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  {editingTeamId === team._id ? (
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none"
                      />
                      <input
                        value={editTeamEmoji}
                        onChange={(e) => setEditTeamEmoji(e.target.value)}
                        placeholder="🇧🇷"
                        className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-lg outline-none"
                        maxLength={8}
                      />
                      <input
                        type="color"
                        value={editTeamColor}
                        onChange={(e) => setEditTeamColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => saveTeamEdit(team._id)}
                        className="rounded-lg bg-fifa-green px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeamId(null);
                          setEditTeamName('');
                          setEditTeamColor('#FF6D00');
                          setEditTeamEmoji('');
                        }}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lg"
                          style={{
                            borderColor: `${team.color || '#FF6D00'}60`,
                            backgroundColor: `${team.color || '#FF6D00'}12`,
                          }}
                        >
                          {team.emoji || team.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-xs text-gray-400">
                            {team.isActive ? 'Active' : 'Inactive'} · {team.color || '#FF6D00'}
                            {team.emoji ? ` · ${team.emoji}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTeamId(team._id);
                            setEditTeamName(team.name);
                            setEditTeamColor(team.color || '#FF6D00');
                            setEditTeamEmoji(team.emoji || '');
                          }}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleTeamActive(team)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs"
                        >
                          {team.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'predictions' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setShowPredictionImport(!showPredictionImport)}
                className="flex w-full items-center justify-between text-left"
              >
                <h2 className="font-semibold">Bulk Import Predictions (CSV / JSON)</h2>
                <span className="text-sm text-gray-400">{showPredictionImport ? '▲' : '▼'}</span>
              </button>

              {showPredictionImport && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-gray-500">
                    Import customer predictions for past matches. Matches must already exist
                    (import matches first with results). Points are calculated automatically
                    for finished matches.
                  </p>
                  <div className="rounded-lg bg-gray-100 p-3 text-xs text-gray-500">
                    <p className="font-medium text-gray-700">Required:</p>
                    <p className="mt-1">phoneNumber, predictedWinner, scoreA, scoreB</p>
                    <p className="mt-1 font-medium text-fifa-primary">Best: use matchId from Matches tab</p>
                    <p className="mt-1">Or: teamA + teamB (+ startTime ISO UTC if needed)</p>
                    <p className="mt-1">Optional: displayName (creates user if new)</p>
                    <p className="mt-1">predictedWinner: exact team name or &quot;draw&quot;</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => downloadSample(SAMPLE_PREDICTIONS_CSV, 'predictions-sample.csv')}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-fifa-primary"
                    >
                      Download CSV sample
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSample(SAMPLE_PREDICTIONS_JSON, 'predictions-sample.json')}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-fifa-primary"
                    >
                      Download JSON sample
                    </button>
                  </div>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition hover:border-fifa-primary/50">
                    <span className="text-2xl">📁</span>
                    <span className="mt-2 text-sm font-medium">Choose CSV or JSON file</span>
                    <input
                      type="file"
                      accept=".csv,.json,application/json,text/csv"
                      className="hidden"
                      disabled={loading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePredictionBulkImport(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {predictionImportResult && (
                    <div className="space-y-2">
                      <div className="rounded-lg bg-fifa-green/20 px-3 py-2 text-sm text-green-300">
                        Imported {predictionImportResult.imported} predictions
                        {predictionImportResult.failed > 0 &&
                          `, ${predictionImportResult.failed} failed`}
                        {predictionImportResult.snapshotsRefreshed > 0 &&
                          ` · ${predictionImportResult.snapshotsRefreshed} rank snapshot${predictionImportResult.snapshotsRefreshed !== 1 ? 's' : ''} refreshed`}
                      </div>
                      {predictionImportResult.errors?.length > 0 && (
                        <div className="max-h-32 overflow-y-auto rounded-lg bg-red-500/10 p-2 text-xs text-red-300">
                          {predictionImportResult.errors.map((e) => (
                            <p key={e.row}>Row {e.row}: {e.message}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {predictions.length === 0 && (
              <p className="text-gray-500">No predictions yet</p>
            )}
            {predictions.map((p) => (
              <div key={p._id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="font-medium">
                  {p.user?.displayName || p.user?.phoneNumber}
                </p>
                <p className="text-gray-500">
                  {p.match?.teamA} vs {p.match?.teamB}
                </p>
                <p>
                  Pick: {p.predictedWinner} ({p.scoreA}-{p.scoreB}) · {p.pointsEarned} pts
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === 'customers' && (
          <div className="space-y-3">
            {statistics.length === 0 && (
              <p className="text-gray-500">No customers yet</p>
            )}
            {statistics.map((entry, i) => {
              const { user, summary, breakdown } = entry;
              const isExpanded = expandedUser === user._id;
              return (
                <div
                  key={user._id}
                  className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedUser(isExpanded ? null : user._id)}
                    className="flex w-full items-center justify-between p-3 text-left"
                  >
                    <div>
                      <p className="font-medium">{user.displayName || user.phoneNumber}</p>
                      <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px]">
                          {summary.totalPredictions} picks
                        </span>
                        {summary.perfectScores > 0 && (
                          <span className="rounded-full bg-fifa-primary/20 px-2 py-0.5 text-[10px] text-fifa-primary">
                            {summary.perfectScores} × 100pts
                          </span>
                        )}
                        {summary.winnerOnly > 0 && (
                          <span className="rounded-full bg-fifa-green/20 px-2 py-0.5 text-[10px] text-fifa-green">
                            {summary.winnerOnly} × 50pts
                          </span>
                        )}
                        {summary.incorrect > 0 && (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300">
                            {summary.incorrect} × 0pts
                          </span>
                        )}
                        {summary.pending > 0 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                            {summary.pending} pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-fifa-primary">{user.totalPoints} pts</p>
                      <p className="text-xs text-gray-400">#{i + 1}</p>
                      <p className="mt-1 text-xs text-gray-400">{isExpanded ? '▲' : '▼'}</p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-100 px-3 py-2">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Points breakdown
                      </p>
                      {breakdown.length === 0 ? (
                        <p className="text-sm text-gray-500">No predictions yet</p>
                      ) : (
                        <div className="space-y-2">
                          {breakdown.map((item) => (
                            <div
                              key={item.predictionId}
                              className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 text-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium">
                                    {item.match
                                      ? `${item.match.teamA} vs ${item.match.teamB}`
                                      : 'Match removed'}
                                  </p>
                                  {item.match?.stage && (
                                    <p className="text-xs text-fifa-primary">{item.match.stage}</p>
                                  )}
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                                    item.pointsEarned === 100
                                      ? 'bg-fifa-primary/20 text-fifa-primary'
                                      : item.pointsEarned === 50
                                        ? 'bg-fifa-green/20 text-fifa-green'
                                        : item.match?.status === 'finished'
                                          ? 'bg-red-500/20 text-red-300'
                                          : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {item.match?.status === 'finished'
                                    ? `+${item.pointsEarned}`
                                    : '—'}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Pick: {item.predictedWinner === 'draw' ? 'Draw' : item.predictedWinner}{' '}
                                ({item.predictedScoreA}-{item.predictedScoreB})
                              </p>
                              {item.match?.status === 'finished' && (
                                <p className="text-xs text-gray-500">
                                  Result: {item.match.scoreA}-{item.match.scoreB} (Winner:{' '}
                                  {item.match.winner === 'draw' ? 'Draw' : item.match.winner})
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-400">{item.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
