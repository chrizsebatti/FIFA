import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { NoMatchesInProgressIcon, NoUpcomingMatchesIcon } from '../components/EmptyStateIcons';
import Layout from '../components/Layout';
import MatchCard from '../components/MatchCard';
import MatchListLoader from '../components/MatchListLoader';
import { getMatchTab } from '../utils/format';

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'finished', label: 'Finished' },
];

const EMPTY_MESSAGES = {
  finished: 'No finished matches yet.',
};

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');

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

  const filteredMatches = useMemo(() => {
    const list = matches.filter((match) => getMatchTab(match) === tab);
    if (tab === 'upcoming') {
      return list.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }
    return list.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [matches, tab]);

  return (
    <Layout>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Matches</h2>

      <div className="mb-4 flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
              tab === item.id
                ? 'bg-[#FF6D00] font-semibold text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <MatchListLoader />}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && filteredMatches.length === 0 && (
        tab === 'upcoming' ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <NoUpcomingMatchesIcon />
            <p className="mt-4 text-base font-semibold text-gray-900">No upcoming matches</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              The schedule is empty — check back soon for the next fixtures.
            </p>
          </div>
        ) : tab === 'in_progress' ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <NoMatchesInProgressIcon />
            <p className="mt-4 text-base font-semibold text-gray-900">No live action right now</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              The pitch is quiet — check Upcoming for the next kickoff.
            </p>
          </div>
        ) : (
          <p className="text-gray-500">{EMPTY_MESSAGES[tab]}</p>
        )
      )}
      {!loading && (
        <div className="space-y-3">
          {filteredMatches.map((match) => (
            <MatchCard key={match._id} match={match} prediction={predictions[match._id]} />
          ))}
        </div>
      )}
    </Layout>
  );
}
