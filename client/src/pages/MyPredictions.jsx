import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import MatchCard from '../components/MatchCard';

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
      <h2 className="mb-4 text-xl font-bold text-gray-900">My Predictions</h2>
      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && predictions.length === 0 && (
        <div className="text-center">
          <p className="text-gray-500">No predictions yet</p>
          <Link to="/matches" className="mt-4 inline-block text-[#FF6D00]">
            Browse matches →
          </Link>
        </div>
      )}
      <div className="space-y-3">
        {predictions.map((p) =>
          p.match ? (
            <MatchCard key={p._id} match={p.match} prediction={p} />
          ) : (
            <div
              key={p._id}
              className="rounded-xl border border-gray-200 bg-white p-4 text-gray-500 shadow-sm"
            >
              Match removed
            </div>
          )
        )}
      </div>
    </Layout>
  );
}
