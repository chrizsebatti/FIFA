import { useState } from 'react';
import { formatDateTime } from '../utils/format';

function pickLabel(pick) {
  return pick === 'draw' ? 'Draw' : pick;
}

function MatchStatCard({ stat }) {
  const { match, distribution, userPick, totalPredictions } = stat;
  const userPickEntry = userPick
    ? distribution.find((d) => d.pick === userPick.predictedWinner)
    : null;
  const userAgreePct = userPickEntry?.percentage ?? 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3">
        <p className="font-medium">
          {match.teamA} vs {match.teamB}
        </p>
        <p className="text-xs text-gray-400">
          {match.stage ? `${match.stage} · ` : ''}
          {formatDateTime(match.startTime)}
          {totalPredictions > 0 && ` · ${totalPredictions} predictions`}
        </p>
      </div>

      {totalPredictions === 0 ? (
        <p className="text-sm text-gray-500">No predictions yet for this match</p>
      ) : (
        <div className="space-y-2">
          {distribution.map((item) => {
            const isUserPick = userPick?.predictedWinner === item.pick;
            return (
              <div key={item.pick}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className={isUserPick ? 'font-semibold text-fifa-primary' : 'text-gray-600'}>
                    {pickLabel(item.pick)}
                    {isUserPick && ' (you)'}
                  </span>
                  <span className="text-gray-500">
                    {item.percentage}% ({item.count})
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isUserPick ? 'bg-fifa-primary' : 'bg-fifa-green/70'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {userPick ? (
        <p className="mt-3 text-xs text-gray-500">
          You picked <span className="text-fifa-primary">{pickLabel(userPick.predictedWinner)}</span>
          {' '}({userPick.scoreA}-{userPick.scoreB}) — {userAgreePct}% of users agreed
        </p>
      ) : (
        <p className="mt-3 text-xs text-gray-400">You have not predicted this match</p>
      )}
    </div>
  );
}

export default function PredictionComparison({ stats }) {
  const [expanded, setExpanded] = useState({});

  const matchesWithPredictions = stats?.filter((s) => s.totalPredictions > 0) || [];
  const matchesWithoutPredictions = stats?.filter((s) => s.totalPredictions === 0) || [];

  if (!stats?.length) {
    return <p className="text-sm text-gray-500">No match data available</p>;
  }

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-3">
      {matchesWithPredictions.map((stat) => (
        <MatchStatCard key={stat.match._id} stat={stat} />
      ))}

      {matchesWithoutPredictions.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => toggle('upcoming')}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
          >
            <span>{matchesWithoutPredictions.length} matches with no predictions yet</span>
            <span>{expanded.upcoming ? '▲' : '▼'}</span>
          </button>
          {expanded.upcoming && (
            <div className="mt-2 space-y-2">
              {matchesWithoutPredictions.map((stat) => (
                <MatchStatCard key={stat.match._id} stat={stat} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
