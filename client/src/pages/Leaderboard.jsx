import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/leaderboard')
      .then((res) => setEntries(res.data.leaderboard))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 className="mb-4 text-xl font-bold">Leaderboard</h2>
      {loading && <p className="text-white/50">Loading...</p>}
      <div className="space-y-2">
        {entries.map((entry) => {
          const isMe =
            entry.displayName === (user?.displayName || '') ||
            entry.maskedPhone === `***${user?.phoneNumber?.slice(-4)}`;
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                isMe
                  ? 'border-fifa-gold/50 bg-fifa-gold/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  entry.rank <= 3 ? 'bg-fifa-gold text-black' : 'bg-white/10'
                }`}
              >
                {entry.rank}
              </span>
              <div className="flex-1">
                <p className="font-medium">{entry.displayName}</p>
                <p className="text-xs text-white/40">{entry.maskedPhone}</p>
              </div>
              <span className="text-lg font-bold text-fifa-gold">{entry.totalPoints}</span>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
