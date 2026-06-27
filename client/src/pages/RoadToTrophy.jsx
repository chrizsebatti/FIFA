import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import BracketStageScores, { BracketLeaderboardList } from '../components/bracket/BracketLeaderboard';
import BracketSubmitBar from '../components/bracket/BracketSubmitBar';
import BracketSubmitConfirm from '../components/bracket/BracketSubmitConfirm';
import BracketTeamPicker from '../components/bracket/BracketTeamPicker';
import BracketTree from '../components/bracket/BracketTree';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  applyPick,
  buildResolvedMatches,
  picksMapToArray,
  picksToMap,
} from '../utils/bracketClient';
import { buildTeamMetaMap } from '../utils/teamEmoji';

const TOTAL_PICKS = 31;

const PAGE_TABS = [
  { id: 'bracket', label: 'My Knock-Out' },
  { id: 'board', label: 'Knock-Out Board' },
];

export default function RoadToTrophy() {
  const { user } = useAuth();
  const [pageTab, setPageTab] = useState('bracket');
  const [matches, setMatches] = useState([]);
  const [config, setConfig] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [picksMap, setPicksMap] = useState({});
  const [teams, setTeams] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pickerMatch, setPickerMatch] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const locked = submission?.status === 'locked';
  const teamMetaMap = useMemo(() => buildTeamMetaMap(teams), [teams]);

  const resolvedMatches = useMemo(
    () => buildResolvedMatches(matches, picksMap),
    [matches, picksMap]
  );

  const pickCount = Object.keys(picksMap).length;

  const loadData = useCallback(async () => {
    const [bracketRes, teamsRes] = await Promise.all([
      api.get('/bracket'),
      api.get('/teams'),
    ]);
    setMatches(bracketRes.data.matches);
    setConfig(bracketRes.data.config);
    setSubmission(bracketRes.data.submission);
    setPicksMap(picksToMap(bracketRes.data.submission?.picks || []));
    setTeams(teamsRes.data.teams);
  }, []);

  const loadLeaderboard = useCallback(async () => {
    const res = await api.get('/bracket/leaderboard');
    setLeaderboard(res.data.leaderboard);
  }, []);

  useEffect(() => {
    Promise.all([loadData(), loadLeaderboard()])
      .catch(() => setError('Failed to load knock-out'))
      .finally(() => setLoading(false));
  }, [loadData, loadLeaderboard]);

  const handlePick = (match, team) => {
    if (locked) return;
    setPicksMap((prev) => applyPick(matches, prev, match.key, team));
    setPickerMatch(null);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.put('/bracket/picks', { picks: picksMapToArray(picksMap) });
      setSuccess('Draft saved');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.put('/bracket/picks', { picks: picksMapToArray(picksMap) });
      await api.post('/bracket/submit');
      setShowSubmitConfirm(false);
      setSuccess('Knock-out submitted and locked!');
      await Promise.all([loadData(), loadLeaderboard()]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit knock-out');
    } finally {
      setSaving(false);
    }
  };

  const openPicker = (match) => {
    if (locked) return;
    if (!match.resolvedTeamA || !match.resolvedTeamB) return;
    setPickerMatch(match);
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading knock-out...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="mb-1 text-xl font-bold text-gray-900">Road to Trophy</h2>
      <p className="mb-4 text-xs text-gray-500">
        Fill the full knock-out tree · +10 pts per correct team at each stage
      </p>

      <div className="mb-4 flex gap-2">
        {PAGE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPageTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
              pageTab === t.id
                ? 'bg-[#FF6D00] font-semibold text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      {success && <p className="mb-3 text-sm text-[#008631]">{success}</p>}

      {pageTab === 'bracket' && (
        <>
          {!config?.predictionsEnabled && !locked && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Waiting for all Round of 32 teams to be assigned by admin.
            </div>
          )}

          {locked && (
            <div className="mb-4 rounded-xl border border-[#008631]/30 bg-[#008631]/10 px-4 py-3 text-sm text-[#008631]">
              Your knock-out is locked. Points update as each stage is evaluated.
            </div>
          )}

          <BracketStageScores stageScores={submission?.stageScores} />

          {locked && (
            <div className="mb-3 flex flex-wrap gap-2 text-[10px] text-gray-500">
              <span className="rounded-full border border-[#008631]/30 bg-[#008631]/10 px-2 py-0.5">
                Green = correct pick
              </span>
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5">
                Red = wrong pick
              </span>
            </div>
          )}

          <BracketTree
            matches={resolvedMatches}
            picksMap={picksMap}
            teamMetaMap={teamMetaMap}
            onPick={openPicker}
            locked={locked}
            showActual
          />

          <BracketSubmitBar
            pickCount={pickCount}
            totalPicks={TOTAL_PICKS}
            predictionsEnabled={config?.predictionsEnabled}
            locked={locked}
            saving={saving}
            onSave={handleSave}
            onSubmit={() => setShowSubmitConfirm(true)}
          />

          {showSubmitConfirm && (
            <BracketSubmitConfirm
              pickCount={pickCount}
              totalPicks={TOTAL_PICKS}
              saving={saving}
              onConfirm={handleSubmit}
              onClose={() => !saving && setShowSubmitConfirm(false)}
            />
          )}

          {pickerMatch && (
            <BracketTeamPicker
              match={pickerMatch}
              teamMetaMap={teamMetaMap}
              onSelect={(team) => handlePick(pickerMatch, team)}
              onClose={() => setPickerMatch(null)}
            />
          )}
        </>
      )}

      {pageTab === 'board' && (
        <BracketLeaderboardList entries={leaderboard} userId={user?._id} />
      )}
    </Layout>
  );
}
