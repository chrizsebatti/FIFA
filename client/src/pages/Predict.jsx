import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import MatchResultLeaderboard from '../components/MatchResultLeaderboard';
import PredictionForm from '../components/PredictionForm';
import { formatDateTime, getMatchStatus, statusLabel } from '../utils/format';
import MatchCountdown from '../components/MatchCountdown';
import TeamFlag from '../components/TeamFlag';
import { validatePredictionConsistency } from '../utils/predictionValidation';
import { buildTeamEmojiMap, getTeamEmoji } from '../utils/teamEmoji';

export default function Predict() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const predictionRef = useRef(null);
  const [match, setMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [predictionStats, setPredictionStats] = useState(null);
  const [scoreA, setScoreA] = useState('0');
  const [scoreB, setScoreB] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teamEmojiMap, setTeamEmojiMap] = useState({});

  const scrollToPrediction = useCallback(() => {
    predictionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (!loading && location.hash === '#predict') {
      const timer = setTimeout(scrollToPrediction, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, location.hash, scrollToPrediction]);

  useEffect(() => {
    Promise.all([
      api.get(`/matches/${id}/my-prediction`),
      api.get(`/matches/${id}/prediction-stats`),
      api.get('/teams'),
    ])
      .then(([predRes, statsRes, teamsRes]) => {
        setMatch(predRes.data.match);
        setPredictionStats(statsRes.data);
        setTeamEmojiMap(buildTeamEmojiMap(teamsRes.data.teams));
        if (predRes.data.prediction) {
          setPrediction(predRes.data.prediction);
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
    let predictedWinner = 'draw';
    if (scoreANum > scoreBNum) predictedWinner = match.teamA;
    else if (scoreBNum > scoreANum) predictedWinner = match.teamB;

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
        <p className="text-gray-500">Loading...</p>
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
        className="mb-4 text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back
      </button>

      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        {match.stage && (
          <p className="mb-1 text-xs font-medium uppercase text-fifa-primary">{match.stage}</p>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col items-center">
            <TeamFlag
              emoji={getTeamEmoji(teamEmojiMap, match.teamA)}
              name={match.teamA}
              size="md"
            />
            <p className="mt-2 text-lg font-bold">{match.teamA}</p>
            {isFinished && (
              <p className="text-2xl font-bold text-fifa-primary">{match.scoreA}</p>
            )}
          </div>
          <span className="text-gray-400">vs</span>
          <div className="flex flex-1 flex-col items-center">
            <TeamFlag
              emoji={getTeamEmoji(teamEmojiMap, match.teamB)}
              name={match.teamB}
              size="md"
            />
            <p className="mt-2 text-lg font-bold">{match.teamB}</p>
            {isFinished && (
              <p className="text-2xl font-bold text-fifa-primary">{match.scoreB}</p>
            )}
          </div>
        </div>
        {!isFinished && (
          <div className="mt-4 rounded-xl border border-[#FF6D00]/20 bg-gradient-to-b from-[#FF6D00]/8 to-white px-4 py-4">
            <MatchCountdown
              startTime={match.startTime}
              isFinished={isFinished}
              isLive={status === 'started'}
              onClick={scrollToPrediction}
            />
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">{formatDateTime(match.startTime)}</p>
        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
          {badge.text}
        </span>
      </div>

      {isFinished ? (
        <>
          {prediction && (
            <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
              <p className="text-gray-500">Your prediction</p>
              <p className="font-medium">
                {prediction.predictedWinner === 'draw' ? 'Draw' : prediction.predictedWinner} (
                {prediction.scoreA}-{prediction.scoreB})
                <span
                  className={`ml-2 font-semibold ${
                    prediction.pointsEarned > 0 ? 'text-[#008631]' : 'text-gray-400'
                  }`}
                >
                  {prediction.pointsEarned > 0 ? `+${prediction.pointsEarned}` : '0'} pts
                </span>
              </p>
            </div>
          )}
          <MatchResultLeaderboard match={match} participants={participants} />
        </>
      ) : (
        <div ref={predictionRef} id="predict" className="scroll-mt-4">
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          {success && <p className="mb-4 text-sm text-green-400">{success}</p>}
          <PredictionForm
            match={match}
            scoreA={scoreA}
            setScoreA={setScoreA}
            scoreB={scoreB}
            setScoreB={setScoreB}
            onSubmit={handleSubmit}
            loading={saving}
            locked={locked}
            predictionStats={predictionStats}
            teamEmojiMap={teamEmojiMap}
          />
        </div>
      )}
    </Layout>
  );
}
