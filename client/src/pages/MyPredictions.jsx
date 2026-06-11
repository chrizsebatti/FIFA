import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import { formatDateTime } from '../utils/format';

export default function MyPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/predictions/me')
      .then((res) => setPredictions(res.data.predictions))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 className="mb-4 text-xl font-bold">My Predictions</h2>
      {loading && <p className="text-white/50">Loading...</p>}
      {!loading && predictions.length === 0 && (
        <div className="text-center">
          <p className="text-white/50">No predictions yet</p>
          <Link to="/matches" className="mt-4 inline-block text-fifa-gold">
            Browse matches →
          </Link>
        </div>
      )}
      <div className="space-y-3">
        {predictions.map((p) => (
          <Link
            key={p._id}
            to={`/matches/${p.match?._id}/predict`}
            className="block rounded-xl border border-white/10 bg-white/5 p-4"
          >
            {p.match ? (
              <>
                <p className="text-xs text-white/50">
                  {p.match.stage || formatDateTime(p.match.startTime)}
                </p>
                <p className="font-semibold">
                  {p.match.teamA} vs {p.match.teamB}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Pick: {p.predictedWinner === 'draw' ? 'Draw' : p.predictedWinner} (
                  {p.scoreA}-{p.scoreB})
                </p>
                {p.match.status === 'finished' && (
                  <p className="mt-1 text-sm">
                    Result: {p.match.scoreA}-{p.match.scoreB} ·{' '}
                    <span className="font-semibold text-fifa-gold">
                      {p.pointsEarned} pts
                    </span>
                  </p>
                )}
              </>
            ) : (
              <p className="text-white/50">Match removed</p>
            )}
          </Link>
        ))}
      </div>
    </Layout>
  );
}
