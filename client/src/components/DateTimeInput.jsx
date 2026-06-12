import { useEffect, useState } from 'react';
import { joinDatetimeLocal, splitDatetimeLocal } from '../utils/format';

const inputClass =
  'min-w-0 w-full max-w-full rounded-lg border border-gray-200 bg-white px-2 py-2.5 text-base text-gray-900 outline-none sm:px-3 sm:text-sm';

export default function DateTimeInput({ value, onChange, required = false }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const split = splitDatetimeLocal(value);
    setDate(split.date);
    setTime(split.time);
  }, [value]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (newDate && time) {
      onChange(joinDatetimeLocal(newDate, time));
    }
  };

  const handleTimeChange = (newTime) => {
    setTime(newTime);
    if (date && newTime) {
      onChange(joinDatetimeLocal(date, newTime));
    }
  };

  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-2">
      <div className="min-w-0">
        <label className="mb-1 block text-xs text-gray-500">Date</label>
        <input
          type="date"
          required={required}
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className={`date-time-input ${inputClass}`}
        />
      </div>
      <div className="min-w-0">
        <label className="mb-1 block text-xs text-gray-500">Time</label>
        <input
          type="time"
          required={required}
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          className={`date-time-input ${inputClass}`}
        />
      </div>
    </div>
  );
}
