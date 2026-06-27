import { useCallback, useEffect, useState } from 'react';
import api from '../../api/client';

const ROUND_LABELS = {
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-finals',
  sf: 'Semi-finals',
  final: 'Final',
};

const STAGE_LABELS = {
  r16: 'Round of 16',
  r8: 'Round of 8',
  r4: 'Round of 4',
  r2: 'Round of 2',
  winner: 'Champion',
};

const PREV_ROUND_LABEL = {
  r16: 'Round of 32',
  qf: 'Round of 16',
  sf: 'Quarter-finals',
  final: 'Semi-finals',
};

export default function AdminBracketTab({ teams, loading, setLoading, setError }) {
  const [bracketMatches, setBracketMatches] = useState([]);
  const [config, setConfig] = useState(null);
  const [roundStatus, setRoundStatus] = useState({});
  const [lockedSubmissions, setLockedSubmissions] = useState(0);
  const [adminTab, setAdminTab] = useState('r32');
  const [syncMessage, setSyncMessage] = useState('');

  const activeTeams = teams.filter((t) => t.isActive);

  const loadBracket = useCallback(async () => {
    try {
      const res = await api.get('/admin/bracket');
      if (res.data.matches.length === 0) {
        await api.post('/admin/bracket/seed');
        const seeded = await api.get('/admin/bracket');
        setBracketMatches(seeded.data.matches);
        setConfig(seeded.data.config);
        setRoundStatus(seeded.data.roundStatus);
        setLockedSubmissions(seeded.data.lockedSubmissions);
        return;
      }
      setBracketMatches(res.data.matches);
      setConfig(res.data.config);
      setRoundStatus(res.data.roundStatus);
      setLockedSubmissions(res.data.lockedSubmissions);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load knock-out');
    }
  }, [setError]);

  useEffect(() => {
    loadBracket();
  }, [loadBracket]);

  const updateR32 = async (key, field, value) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.put(`/admin/bracket/r32/${key}`, { [field]: value || null });
      await loadBracket();
      setConfig(res.data.config);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update R32 match');
    } finally {
      setLoading(false);
    }
  };

  const setWinner = async (key, winner) => {
    setError('');
    setLoading(true);
    try {
      await api.put(`/admin/bracket/${key}/winner`, { winner });
      await loadBracket();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set winner');
    } finally {
      setLoading(false);
    }
  };

  const syncKnockout = async () => {
    setError('');
    setSyncMessage('');
    setLoading(true);
    try {
      const res = await api.post('/admin/bracket/sync');
      const { usersUpdated, stagesSynced, totalPointsAwarded } = res.data;
      setSyncMessage(
        `Synced ${usersUpdated} user${usersUpdated !== 1 ? 's' : ''} · ` +
          `${stagesSynced.length} stage${stagesSynced.length !== 1 ? 's' : ''} · ` +
          `${totalPointsAwarded} total pts`
      );
      await loadBracket();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sync knockout points');
    } finally {
      setLoading(false);
    }
  };

  const r32Matches = bracketMatches.filter((m) => m.round === 'r32');
  const r32Filled = r32Matches.filter((m) => m.teamA && m.teamB).length;

  const rounds = ['r32', 'r16', 'qf', 'sf', 'final'];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h2 className="font-semibold">Road to Trophy — Knock-Out</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-gray-100 px-2 py-0.5">
            R32: {r32Filled}/16 filled
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5">
            {lockedSubmissions} locked submissions
          </span>
          <span
            className={`rounded-full px-2 py-0.5 ${
              config?.predictionsEnabled
                ? 'bg-fifa-green/20 text-fifa-green'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {config?.predictionsEnabled ? 'Predictions open' : 'Predictions closed'}
          </span>
        </div>
        <button
          type="button"
          disabled={loading || lockedSubmissions === 0}
          onClick={syncKnockout}
          className="mt-3 w-full rounded-lg bg-[#FF6D00] py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {loading ? 'Syncing...' : 'Knock-out Sync'}
        </button>
        <p className="mt-1.5 text-[10px] text-gray-500">
          Recalculates knock-out points for all locked submissions from latest results.
        </p>
        {syncMessage && (
          <p className="mt-2 rounded-lg bg-[#008631]/10 px-3 py-2 text-xs font-medium text-[#008631]">
            {syncMessage}
          </p>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {rounds.map((round) => (
          <button
            key={round}
            type="button"
            onClick={() => setAdminTab(round)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs transition-colors ${
              adminTab === round
                ? 'bg-[#FF6D00] font-semibold text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {ROUND_LABELS[round]}
          </button>
        ))}
      </div>

      {adminTab === 'r32' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Assign teams to all 16 matchups, then record each winner below. R16 unlocks after
            R32 results are in.
          </p>
          {r32Matches.map((match) => {
            const canSetWinner = Boolean(match.teamA && match.teamB);

            return (
            <div key={match.key} className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="mb-2 text-xs font-medium text-[#FF6D00]">{match.key}</p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={match.teamA || ''}
                  disabled={loading || lockedSubmissions > 0}
                  onChange={(e) => updateR32(match.key, 'teamA', e.target.value)}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-sm"
                >
                  <option value="">Team A</option>
                  {activeTeams.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.emoji ? `${t.emoji} ` : ''}
                      {t.name}
                    </option>
                  ))}
                </select>
                <select
                  value={match.teamB || ''}
                  disabled={loading || lockedSubmissions > 0}
                  onChange={(e) => updateR32(match.key, 'teamB', e.target.value)}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-sm"
                >
                  <option value="">Team B</option>
                  {activeTeams.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.emoji ? `${t.emoji} ` : ''}
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              {match.actualWinner && (
                <p className="mt-2 text-sm text-[#008631]">Winner: {match.actualWinner}</p>
              )}
              {canSetWinner && !match.actualWinner && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setWinner(match.key, match.teamA)}
                    className="flex-1 rounded-lg border border-[#FF6D00]/40 py-1.5 text-xs font-medium text-[#FF6D00]"
                  >
                    {match.teamA} won
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setWinner(match.key, match.teamB)}
                    className="flex-1 rounded-lg border border-[#FF6D00]/40 py-1.5 text-xs font-medium text-[#FF6D00]"
                  >
                    {match.teamB} won
                  </button>
                </div>
              )}
              {canSetWinner && match.actualWinner && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setWinner(match.key, match.teamA)}
                    className={`flex-1 rounded-lg py-1.5 text-xs ${
                      match.actualWinner === match.teamA
                        ? 'bg-[#FF6D00] text-white'
                        : 'border border-gray-200 text-gray-500'
                    }`}
                  >
                    {match.teamA}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setWinner(match.key, match.teamB)}
                    className={`flex-1 rounded-lg py-1.5 text-xs ${
                      match.actualWinner === match.teamB
                        ? 'bg-[#FF6D00] text-white'
                        : 'border border-gray-200 text-gray-500'
                    }`}
                  >
                    {match.teamB}
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {adminTab !== 'r32' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Teams come from the previous round&apos;s winners. Finish{' '}
            {PREV_ROUND_LABEL[adminTab]} results first if you see — vs —.
          </p>
          {bracketMatches
            .filter((m) => m.round === adminTab)
            .map((match) => {
              const teamA = match.resolvedTeamA || match.teamA;
              const teamB = match.resolvedTeamB || match.teamB;
              const canSetWinner = Boolean(teamA && teamB);

              return (
                <div key={match.key} className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-400">{match.key}</p>
                  <p className="font-medium">
                    {teamA || '—'} <span className="text-gray-400">vs</span> {teamB || '—'}
                  </p>
                  {match.actualWinner && (
                    <p className="mt-1 text-sm text-[#008631]">Winner: {match.actualWinner}</p>
                  )}
                  {canSetWinner && !match.actualWinner && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setWinner(match.key, teamA)}
                        className="flex-1 rounded-lg border border-[#FF6D00]/40 py-1.5 text-xs font-medium text-[#FF6D00]"
                      >
                        {teamA} won
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setWinner(match.key, teamB)}
                        className="flex-1 rounded-lg border border-[#FF6D00]/40 py-1.5 text-xs font-medium text-[#FF6D00]"
                      >
                        {teamB} won
                      </button>
                    </div>
                  )}
                  {canSetWinner && match.actualWinner && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setWinner(match.key, teamA)}
                        className={`flex-1 rounded-lg py-1.5 text-xs ${
                          match.actualWinner === teamA
                            ? 'bg-[#FF6D00] text-white'
                            : 'border border-gray-200 text-gray-500'
                        }`}
                      >
                        {teamA}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setWinner(match.key, teamB)}
                        className={`flex-1 rounded-lg py-1.5 text-xs ${
                          match.actualWinner === teamB
                            ? 'bg-[#FF6D00] text-white'
                            : 'border border-gray-200 text-gray-500'
                        }`}
                      >
                        {teamB}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Stage evaluation status
        </p>
        <div className="space-y-1 text-xs text-gray-600">
          {Object.entries(roundStatus).map(([round, status]) =>
            status.evaluatedStage ? (
              <p key={round}>
                {ROUND_LABELS[round]}: {status.withWinner}/{status.total} results · evaluates{' '}
                {STAGE_LABELS[status.evaluatedStage]}
                {status.complete ? ' ✓' : ''}
              </p>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
