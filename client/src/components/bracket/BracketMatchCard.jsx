import TeamFlag from '../TeamFlag';
import { getTeamMeta } from '../../utils/teamEmoji';

function TeamCircle({ teamName, teamMetaMap, selected, pickResult }) {
  const meta = getTeamMeta(teamMetaMap, teamName);
  const content = teamName ? (
    <TeamFlag emoji={meta.emoji} name={teamName} size="sm" />
  ) : (
    <span className="text-xs text-gray-400">?</span>
  );

  let ringClass = 'border-gray-200';
  if (selected && pickResult === 'correct') {
    ringClass = 'border-[#008631] ring-2 ring-[#008631]/30';
  } else if (selected && pickResult === 'incorrect') {
    ringClass = 'border-red-400 ring-2 ring-red-300/40';
  } else if (selected) {
    ringClass = 'border-[#FF6D00] ring-2 ring-[#FF6D00]/30';
  }

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${ringClass}`}
      style={{ backgroundColor: teamName ? `${meta.color}18` : '#f9fafb' }}
    >
      {content}
    </div>
  );
}

function getPickResult(match, pickedWinner) {
  if (!pickedWinner || !match.actualWinner) return null;
  return pickedWinner === match.actualWinner ? 'correct' : 'incorrect';
}

export default function BracketMatchCard({
  match,
  pickedWinner,
  teamMetaMap,
  onPick,
  locked,
  showActual,
}) {
  const teamA = match.resolvedTeamA;
  const teamB = match.resolvedTeamB;
  const canPick = !locked && teamA && teamB && onPick;
  const pickResult = getPickResult(match, pickedWinner);

  const cardTone =
    pickResult === 'correct'
      ? 'border-[#008631]/40 bg-[#008631]/10'
      : pickResult === 'incorrect'
        ? 'border-red-200 bg-red-50'
        : 'border-gray-200 bg-white';

  const handleTap = () => {
    if (canPick) onPick(match);
  };

  return (
    <button
      type="button"
      disabled={!canPick}
      onClick={handleTap}
      className={`w-36 rounded-xl border p-2 text-left shadow-sm transition ${
        canPick ? 'active:scale-[0.98]' : ''
      } ${cardTone} ${pickedWinner && !pickResult ? 'ring-1 ring-[#FF6D00]/30' : ''}`}
    >
      <p className="mb-2 truncate text-center text-[10px] font-medium uppercase text-gray-400">
        {match.key}
      </p>
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <TeamCircle
            teamName={teamA}
            teamMetaMap={teamMetaMap}
            selected={pickedWinner === teamA}
            pickResult={pickedWinner === teamA ? pickResult : null}
          />
          <p className="w-full truncate text-center text-[10px] font-medium text-gray-700">
            {teamA || 'TBD'}
          </p>
        </div>
        <span className="text-[10px] text-gray-400">vs</span>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <TeamCircle
            teamName={teamB}
            teamMetaMap={teamMetaMap}
            selected={pickedWinner === teamB}
            pickResult={pickedWinner === teamB ? pickResult : null}
          />
          <p className="w-full truncate text-center text-[10px] font-medium text-gray-700">
            {teamB || 'TBD'}
          </p>
        </div>
      </div>
      {showActual && match.actualWinner && pickedWinner && (
        <div className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-[10px] leading-snug">
          <p
            className={
              pickResult === 'incorrect'
                ? 'text-red-500'
                : 'text-[#008631]'
            }
          >
            You choose:{' '}
            <span className="font-semibold">{pickedWinner}</span>
          </p>
          <p className="text-[#008631]">
            Winner:{' '}
            <span className="font-semibold">{match.actualWinner}</span>
          </p>
          <p
            className={`font-semibold ${
              pickResult === 'correct' ? 'text-[#008631]' : 'text-red-500'
            }`}
          >
            {pickResult === 'correct' ? '+10 pts' : '+0 pts'}
          </p>
        </div>
      )}
    </button>
  );
}
