import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import LeaderboardLoader from '../components/LeaderboardLoader';
import LeaderboardPointsHistory from '../components/LeaderboardPointsHistory';
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
  const [expandedUser, setExpandedUser] = useState(null);
  const [historyByUser, setHistoryByUser] = useState({});
  const [historyLoading, setHistoryLoading] = useState(null);

  useEffect(() => {
    api
      .get('/leaderboard')
      .then((res) => setEntries(res.data.leaderboard))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }

    setExpandedUser(userId);

    if (historyByUser[userId]) return;

    setHistoryLoading(userId);
    try {
      const res = await api.get(`/leaderboard/${userId}/points`);
      setHistoryByUser((prev) => ({ ...prev, [userId]: res.data.history }));
    } catch {
      setHistoryByUser((prev) => ({ ...prev, [userId]: [] }));
    } finally {
      setHistoryLoading(null);
    }
  };

  return (
    <Layout>
      <h2 className="mb-1 text-xl font-bold">Leaderboard</h2>
      <p className="mb-4 text-xs text-gray-500">
        ▲ moved up · ▼ moved down after last scored match · Tap a row for point history
      </p>
      {loading && <LeaderboardLoader />}
      {!loading && (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isMe = entry.userId === user?._id;
            const isExpanded = expandedUser === entry.userId;

            return (
              <div
                key={entry.userId || entry.rank}
                className={`overflow-hidden rounded-xl border ${
                  isMe
                    ? 'border-fifa-primary/50 bg-fifa-primary/10'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(entry.userId)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
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
                    <span className="text-[10px] text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200/80 bg-white/60">
                    <p className="px-4 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Point history
                    </p>
                    <LeaderboardPointsHistory
                      loading={historyLoading === entry.userId}
                      history={historyByUser[entry.userId]}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
