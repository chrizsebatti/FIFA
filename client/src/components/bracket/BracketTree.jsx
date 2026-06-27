import BracketMatchCard from './BracketMatchCard';

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'];

const ROUND_LABELS = {
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Round of 8',
  sf: 'Round of 4',
  final: 'Final',
};

export default function BracketTree({
  matches,
  picksMap,
  teamMetaMap,
  onPick,
  locked,
  showActual,
}) {
  const getPick = (key) => picksMap[key] || null;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-4">
        {ROUND_ORDER.map((round) => {
          const roundMatches = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.matchIndex - b.matchIndex);

          return (
            <div key={round} className="flex w-40 shrink-0 flex-col">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-[#FF6D00]">
                {ROUND_LABELS[round]}
              </p>
              <div className="flex flex-col justify-around gap-3" style={{ minHeight: round === 'r32' ? '520px' : 'auto' }}>
                {roundMatches.map((match) => (
                  <BracketMatchCard
                    key={match.key}
                    match={match}
                    pickedWinner={getPick(match.key)}
                    teamMetaMap={teamMetaMap}
                    onPick={onPick}
                    locked={locked}
                    showActual={showActual}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
