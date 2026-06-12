import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import MatchResultLeaderboard from '../components/MatchResultLeaderboard';
import PredictionForm from '../components/PredictionForm';
import { formatDateTime, getMatchStatus, statusLabel } from '../utils/format';
import { validatePredictionConsistency } from '../utils/predictionValidation';

export default function Predict() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [predictionStats, setPredictionStats] = useState(null);
  const [predictedWinner, setPredictedWinner] = useState('');
  const [scoreA, setScoreA] = useState('0');
  const [scoreB, setScoreB] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/matches/${id}/my-prediction`),
      api.get(`/matches/${id}/prediction-stats`),
    ])
      .then(([predRes, statsRes]) => {
        setMatch(predRes.data.match);
        setPredictionStats(statsRes.data);
        if (predRes.data.prediction) {
          setPrediction(predRes.data.prediction);
          setPredictedWinner(predRes.data.prediction.predictedWinner);
          setScoreA(String(predRes.data.prediction.scoreA));
          setScoreB(String(predRes.data.prediction.scoreB));
        }
        if (predRes.data.match?.status === 'finished') {
          return api.get(`/matches/${id}/participants`).then((pRes) => {
            setParticipants(pRes.data.participants);
          });
        }
      })
      .catch(() => setError('Failed to load match'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const scoreANum = Number(scoreA);
    const scoreBNum = Number(scoreB);
    const consistencyError = validatePredictionConsistency(
      match,
      predictedWinner,
      scoreANum,
      scoreBNum
    );
    if (consistencyError) {
      setError(consistencyError);
      return;
    }

    setSaving(true);
    try {
      await api.post('/predictions', {
        matchId: id,
        predictedWinner,
        scoreA: scoreANum,
        scoreB: scoreBNum,
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
  const isFinished = match.status === 'finished';

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
          <div className="flex-1">
            <p className="text-lg font-bold">{match.teamA}</p>
            {isFinished && (
              <p className="text-2xl font-bold text-fifa-gold">{match.scoreA}</p>
            )}
          </div>
          <span className="text-white/30">vs</span>
          <div className="flex-1">
            <p className="text-lg font-bold">{match.teamB}</p>
            {isFinished && (
              <p className="text-2xl font-bold text-fifa-gold">{match.scoreB}</p>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-white/50">{formatDateTime(match.startTime)}</p>
        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
          {badge.text}
        </span>
      </div>

      {isFinished ? (
        <>
          {prediction && (
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <p className="text-white/50">Your prediction</p>
              <p className="font-medium">
                {prediction.predictedWinner === 'draw' ? 'Draw' : prediction.predictedWinner} (
                {prediction.scoreA}-{prediction.scoreB})
                <span className="ml-2 text-fifa-gold">+{prediction.pointsEarned} pts</span>
              </p>
            </div>
          )}
          <MatchResultLeaderboard match={match} participants={participants} />
        </>
      ) : (
        <>
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
            predictionStats={predictionStats}
          />
        </>
      )}
    </Layout>
  );
}
