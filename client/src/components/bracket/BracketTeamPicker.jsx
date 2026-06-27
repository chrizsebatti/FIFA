import TeamFlag from '../TeamFlag';
import { getTeamMeta } from '../../utils/teamEmoji';

export default function BracketTeamPicker({ match, teamMetaMap, onSelect, onClose }) {
  const teams = [match.resolvedTeamA, match.resolvedTeamB].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
        <p className="mb-1 text-center text-sm font-semibold text-gray-900">Pick winner</p>
        <p className="mb-4 text-center text-xs text-gray-500">{match.key}</p>
        <div className="flex justify-center gap-6">
          {teams.map((team) => {
            const meta = getTeamMeta(teamMetaMap, team);
            return (
              <button
                key={team}
                type="button"
                onClick={() => onSelect(team)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FF6D00]/40"
                  style={{ backgroundColor: `${meta.color}20` }}
                >
                  <TeamFlag emoji={meta.emoji} name={team} size="lg" />
                </div>
                <span className="max-w-[100px] truncate text-sm font-medium">{team}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
