import { getWinner } from './scoring.js';

const REQUIRED_FIELDS = ['teamA', 'teamB', 'startTime'];

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row');
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line).map((v) => v.replace(/^"|"$/g, '').trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

export function parseImportPayload({ format, data }) {
  if (format === 'json') {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (!Array.isArray(parsed)) {
      throw new Error('JSON must be an array of match objects');
    }
    return parsed;
  }

  if (format === 'csv') {
    if (typeof data !== 'string') {
      throw new Error('CSV data must be a string');
    }
    return parseCSV(data);
  }

  throw new Error('format must be "json" or "csv"');
}

function normalizeRow(row, rowIndex) {
  const teamA = String(row.teamA ?? '').trim();
  const teamB = String(row.teamB ?? '').trim();
  const startTimeRaw = String(row.startTime ?? '').trim();
  const stage = String(row.stage ?? '').trim();

  for (const field of REQUIRED_FIELDS) {
    if (!String(row[field] ?? '').trim()) {
      throw new Error(`Row ${rowIndex}: missing required field "${field}"`);
    }
  }

  const startTime = new Date(startTimeRaw);
  if (Number.isNaN(startTime.getTime())) {
    throw new Error(`Row ${rowIndex}: invalid startTime "${startTimeRaw}"`);
  }

  const hasScoreA = row.scoreA !== '' && row.scoreA != null;
  const hasScoreB = row.scoreB !== '' && row.scoreB != null;

  if (hasScoreA !== hasScoreB) {
    throw new Error(`Row ${rowIndex}: scoreA and scoreB must both be provided for past matches`);
  }

  const matchData = {
    teamA,
    teamB,
    startTime,
    stage,
  };

  if (hasScoreA && hasScoreB) {
    const scoreA = Number(row.scoreA);
    const scoreB = Number(row.scoreB);
    if (scoreA < 0 || scoreB < 0 || !Number.isInteger(scoreA) || !Number.isInteger(scoreB)) {
      throw new Error(`Row ${rowIndex}: scores must be non-negative integers`);
    }
    matchData.scoreA = scoreA;
    matchData.scoreB = scoreB;
    matchData.winner = getWinner(teamA, teamB, scoreA, scoreB);
    matchData.status = 'finished';
  }

  return matchData;
}

export function normalizeImportRows(rows) {
  return rows.map((row, index) => normalizeRow(row, index + 1));
}
