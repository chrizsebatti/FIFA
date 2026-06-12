import mongoose from 'mongoose';
import Prediction from '../models/Prediction.js';
import User from '../models/User.js';

export function calculatePoints(prediction, match) {
  const winnerCorrect = prediction.predictedWinner === match.winner;
  const scoreCorrect =
    prediction.scoreA === match.scoreA && prediction.scoreB === match.scoreB;

  if (winnerCorrect && scoreCorrect) return 100;
  if (winnerCorrect) return 50;
  return 0;
}

export function getPointsReason(prediction, match) {
  if (!match || match.status !== 'finished') return 'Pending — match not finished';
  const points = calculatePoints(prediction, match);
  if (points === 100) return 'Correct winner + exact score';
  if (points === 50) return 'Correct winner only';
  return 'Incorrect prediction';
}

export function getWinner(teamA, teamB, scoreA, scoreB) {
  if (scoreA > scoreB) return teamA;
  if (scoreB > scoreA) return teamB;
  return 'draw';
}

export async function scoreMatch(match) {
  const predictions = await Prediction.find({ match: match._id });
  const affectedUserIds = new Set();

  for (const prediction of predictions) {
    prediction.pointsEarned = calculatePoints(prediction, match);
    await prediction.save();
    affectedUserIds.add(prediction.user.toString());
  }

  for (const userId of affectedUserIds) {
    const result = await Prediction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$pointsEarned' } } },
    ]);
    const totalPoints = result[0]?.total || 0;
    await User.findByIdAndUpdate(userId, { totalPoints });
  }
}
