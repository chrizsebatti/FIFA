import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import MatchCard from '../components/MatchCard';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/matches'), api.get('/predictions/me')])
      .then(([matchesRes, predsRes]) => {
        setMatches(matchesRes.data.matches);
        const map = {};
        predsRes.data.predictions.forEach((p) => {
          if (p.match) map[p.match._id] = p;
        });
        setPredictions(map);
      })
      .catch(() => setError('Failed to load matches'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 className="mb-4 text-xl font-bold">Upcoming Matches</h2>
      {loading && <p className="text-white/50">Loading matches...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && matches.length === 0 && (
        <p className="text-white/50">No matches yet. Check back soon!</p>
      )}
      <div className="space-y-3">
        {matches.map((match) => (
          <MatchCard key={match._id} match={match} prediction={predictions[match._id]} />
        ))}
      </div>
    </Layout>
  );
}
