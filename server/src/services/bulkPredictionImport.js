import mongoose from 'mongoose';
import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import User from '../models/User.js';
import { calculatePoints } from './scoring.js';
import { parseImportPayload } from './bulkImport.js';
import { snapshotLeaderboardRanks } from './rankSnapshot.js';

const REQUIRED = ['phoneNumber', 'predictedWinner', 'scoreA', 'scoreB'];
const TIME_TOLERANCE_MS = 5 * 60 * 1000;

function normalizeTeam(name) {
  return String(name ?? '').trim();
}

function teamsEqual(a, b) {
  return normalizeTeam(a).toLowerCase() === normalizeTeam(b).toLowerCase();
}

function teamsMatchFixture(match, teamA, teamB) {
  return (
    (teamsEqual(match.teamA, teamA) && teamsEqual(match.teamB, teamB)) ||
    (teamsEqual(match.teamA, teamB) && teamsEqual(match.teamB, teamA))
  );
}

function timeMatches(match, startTimeRaw) {
  if (!startTimeRaw) return true;
  const target = new Date(startTimeRaw).getTime();
  if (Number.isNaN(target)) return false;
  return Math.abs(new Date(match.startTime).getTime() - target) <= TIME_TOLERANCE_MS;
}

function stageMatches(match, stage) {
  if (!stage) return true;
  return normalizeTeam(match.stage).toLowerCase() === normalizeTeam(stage).toLowerCase();
}

function formatMatchHint(match) {
  return `${match.teamA} vs ${match.teamB} @ ${new Date(match.startTime).toISOString()} (id: ${match._id})`;
}

async function findMatch(row, rowIndex) {
  const matchId = String(row.matchId ?? '').trim();
  if (matchId) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error(`Row ${rowIndex}: match not found for matchId "${matchId}"`);
    return match;
  }

  const teamA = normalizeTeam(row.teamA);
  const teamB = normalizeTeam(row.teamB);
  const startTimeRaw = String(row.startTime ?? '').trim();
  const stage = normalizeTeam(row.stage);

  if (!teamA || !teamB) {
    throw new Error(`Row ${rowIndex}: provide matchId or both teamA and teamB`);
  }

  if (startTimeRaw) {
    const parsed = new Date(startTimeRaw);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Row ${rowIndex}: invalid startTime "${startTimeRaw}"`);
    }
  }

  const allMatches = await Match.find().sort({ startTime: 1 });
  const candidates = allMatches.filter(
    (m) => teamsMatchFixture(m, teamA, teamB) && timeMatches(m, startTimeRaw) && stageMatches(m, stage)
  );

  if (candidates.length === 1) return candidates[0];

  if (candidates.length > 1) {
    throw new Error(
      `Row ${rowIndex}: multiple matches found for ${teamA} vs ${teamB} — use matchId. Options: ${candidates.map(formatMatchHint).join('; ')}`
    );
  }

  const byTeamsOnly = allMatches.filter((m) => teamsMatchFixture(m, teamA, teamB));
  if (byTeamsOnly.length === 1) return byTeamsOnly[0];

  const hints = byTeamsOnly.length
    ? byTeamsOnly.map(formatMatchHint).join('; ')
    : allMatches.map(formatMatchHint).join('; ');

  throw new Error(
    `Row ${rowIndex}: no match found for ${teamA} vs ${teamB}${startTimeRaw ? ` at ${startTimeRaw}` : ''}. In DB: ${hints || 'no matches yet'}`
  );
}

function resolvePredictedWinner(predictedWinner, match, rowIndex) {
  const pick = normalizeTeam(predictedWinner);
  if (pick.toLowerCase() === 'draw') return 'draw';
  if (teamsEqual(pick, match.teamA)) return match.teamA;
  if (teamsEqual(pick, match.teamB)) return match.teamB;
  throw new Error(
    `Row ${rowIndex}: predictedWinner must be "${match.teamA}", "${match.teamB}", or "draw"`
  );
}

async function findOrCreateUser(phoneNumber, displayName, onCreate) {
  let user = await User.findOne({ phoneNumber });
  if (!user) {
    user = await User.create({
      phoneNumber,
      displayName: displayName?.trim() || '',
    });
    onCreate();
  } else if (displayName?.trim() && !user.displayName) {
    user.displayName = displayName.trim();
    await user.save();
  }
  return user;
}

function validateRow(row, rowIndex) {
  for (const field of REQUIRED) {
    if (row[field] === '' || row[field] == null) {
      throw new Error(`Row ${rowIndex}: missing required field "${field}"`);
    }
  }
  if (!String(row.matchId ?? '').trim() && !(normalizeTeam(row.teamA) && normalizeTeam(row.teamB))) {
    throw new Error(`Row ${rowIndex}: provide matchId or both teamA and teamB`);
  }

  const scoreA = Number(row.scoreA);
  const scoreB = Number(row.scoreB);
  if (scoreA < 0 || scoreB < 0 || !Number.isInteger(scoreA) || !Number.isInteger(scoreB)) {
    throw new Error(`Row ${rowIndex}: scoreA and scoreB must be non-negative integers`);
  }

  return {
    phoneNumber: String(row.phoneNumber).trim(),
    displayName: String(row.displayName ?? '').trim(),
    predictedWinner: String(row.predictedWinner).trim(),
    scoreA,
    scoreB,
  };
}

export async function importPredictions({ format, data }) {
  const rows = parseImportPayload({ format, data });
  if (rows.length === 0) {
    throw new Error('No predictions to import');
  }

  const errors = [];
  let imported = 0;
  let usersCreated = 0;
  const finishedMatchIds = new Set();
  const affectedUserIds = new Set();

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 1;
    try {
      const parsed = validateRow(rows[i], rowIndex);
      const match = await findMatch(rows[i], rowIndex);
      const user = await findOrCreateUser(parsed.phoneNumber, parsed.displayName, () => {
        usersCreated++;
      });

      const predictedWinner = resolvePredictedWinner(parsed.predictedWinner, match, rowIndex);

      const pointsEarned =
        match.status === 'finished'
          ? calculatePoints({ ...parsed, predictedWinner }, match)
          : 0;

      await Prediction.findOneAndUpdate(
        { user: user._id, match: match._id },
        {
          predictedWinner,
          scoreA: parsed.scoreA,
          scoreB: parsed.scoreB,
          pointsEarned,
        },
        { upsert: true, new: true, runValidators: true }
      );

      affectedUserIds.add(user._id.toString());
      if (match.status === 'finished') {
        finishedMatchIds.add(match._id.toString());
      }
      imported++;
    } catch (err) {
      errors.push({ row: rowIndex, message: err.message });
    }
  }

  for (const userId of affectedUserIds) {
    const result = await Prediction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$pointsEarned' } } },
    ]);
    await User.findByIdAndUpdate(userId, { totalPoints: result[0]?.total || 0 });
  }

  let snapshotsRefreshed = 0;
  if (finishedMatchIds.size > 0) {
    const touchedMatches = await Match.find({
      _id: { $in: [...finishedMatchIds] },
      status: 'finished',
    })
      .sort({ startTime: 1 })
      .select('_id startTime');

    if (touchedMatches.length > 0) {
      const earliestStart = touchedMatches[0].startTime;
      const matchesToSnapshot = await Match.find({
        status: 'finished',
        startTime: { $gte: earliestStart },
      }).sort({ startTime: 1 });

      for (const match of matchesToSnapshot) {
        await snapshotLeaderboardRanks(match._id);
        snapshotsRefreshed++;
      }
    }
  }

  return {
    imported,
    failed: errors.length,
    errors,
    usersCreated,
    scoredMatches: finishedMatchIds.size,
    snapshotsRefreshed,
  };
}
