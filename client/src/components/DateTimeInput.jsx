import { joinDatetimeLocal, splitDatetimeLocal } from '../utils/format';

const inputClass =
  'min-w-0 w-full max-w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2.5 text-base outline-none sm:px-3 sm:text-sm';

export default function DateTimeInput({ value, onChange, required = false }) {
  const { date, time } = splitDatetimeLocal(value);

  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-2">
      <input
        type="date"
        required={required}
        value={date}
        onChange={(e) => onChange(joinDatetimeLocal(e.target.value, time))}
        className={`date-time-input ${inputClass}`}
      />
      <input
        type="time"
        required={required}
        value={time}
        onChange={(e) => onChange(joinDatetimeLocal(date, e.target.value))}
        className={`date-time-input ${inputClass}`}
      />
    </div>
  );
}
