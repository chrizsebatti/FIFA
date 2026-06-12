import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import RankArrow from '../components/RankArrow';
import { useAuth } from '../context/AuthContext';

function matchLabel(match) {
  if (!match) return '';
  return `${match.teamA} vs ${match.teamB}`;
}

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
      <h2 className="mb-1 text-xl font-bold">Leaderboard</h2>
      <p className="mb-4 text-xs text-gray-500">
        ▲ moved up · ▼ moved down after last scored match
      </p>
      {loading && <p className="text-gray-500">Loading...</p>}
      <div className="space-y-2">
        {entries.map((entry) => {
          const isMe = entry.userId === user?._id;
          return (
            <div
              key={entry.userId || entry.rank}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                isMe
                  ? 'border-fifa-primary/50 bg-fifa-primary/10'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  entry.rank === 1
                    ? 'bg-[#FF6D00] text-white'
                    : 'border-2 border-[#FF6D00] text-[#FF6D00]'
                }`}
              >
                {entry.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{entry.displayName}</p>
                <p className="text-xs text-gray-400">{entry.maskedPhone}</p>
                {entry.lastMatch && entry.rankChange != null && (
                  <p className="mt-0.5 truncate text-[10px] text-gray-400">
                    After {matchLabel(entry.lastMatch)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-lg font-bold text-[#FF6D00]">{entry.totalPoints}</span>
                {entry.rankChange != null && (
                  <RankArrow change={entry.rankChange} className="text-xs font-semibold" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
