import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import PredictionForm from '../components/PredictionForm';
import { formatDateTime, getMatchStatus, statusLabel } from '../utils/format';

export default function Predict() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [predictedWinner, setPredictedWinner] = useState('');
  const [scoreA, setScoreA] = useState('0');
  const [scoreB, setScoreB] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api
      .get(`/matches/${id}/my-prediction`)
      .then((res) => {
        setMatch(res.data.match);
        if (res.data.prediction) {
          setPredictedWinner(res.data.prediction.predictedWinner);
          setScoreA(String(res.data.prediction.scoreA));
          setScoreB(String(res.data.prediction.scoreB));
        }
      })
      .catch(() => setError('Failed to load match'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.post('/predictions', {
        matchId: id,
        predictedWinner,
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
      });
      setSuccess('Prediction saved!');
      setTimeout(() => navigate('/matches'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save prediction');
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

  if (!match) {
    return (
      <Layout>
        <p className="text-red-400">Match not found</p>
      </Layout>
    );
  }

  const status = getMatchStatus(match);
  const badge = statusLabel(status);
  const locked = match.isLocked;

  return (
    <Layout>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-white/50 hover:text-white"
      >
        ← Back
      </button>

      <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
        {match.stage && (
          <p className="mb-1 text-xs font-medium uppercase text-fifa-gold">{match.stage}</p>
        )}
        <div className="flex items-center justify-between gap-4">
          <p className="flex-1 text-lg font-bold">{match.teamA}</p>
          <span className="text-white/30">vs</span>
          <p className="flex-1 text-lg font-bold">{match.teamB}</p>
        </div>
        <p className="mt-2 text-xs text-white/50">{formatDateTime(match.startTime)}</p>
        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
          {badge.text}
        </span>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-400">{success}</p>}

      <PredictionForm
        match={match}
        predictedWinner={predictedWinner}
        setPredictedWinner={setPredictedWinner}
        scoreA={scoreA}
        setScoreA={setScoreA}
        scoreB={scoreB}
        setScoreB={setScoreB}
        onSubmit={handleSubmit}
        loading={saving}
        locked={locked}
      />
    </Layout>
  );
}
