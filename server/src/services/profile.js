import Prediction from '../models/Prediction.js';
import RankSnapshot from '../models/RankSnapshot.js';
import User from '../models/User.js';
import { computeLeaderboard } from './rankSnapshot.js';

export async function buildProfile(userId) {
  const user = await User.findById(userId).populate('favoriteTeam', 'name color emoji');
  if (!user) return null;

  const leaderboard = await computeLeaderboard();
  const rankIndex = leaderboard.findIndex((u) => u._id.toString() === userId.toString());
  const currentRank = rankIndex >= 0 ? rankIndex + 1 : null;

  const predictions = await Prediction.find({ user: userId }).populate('match');
  const finished = predictions.filter((p) => p.match?.status === 'finished');
  const perfectScores = finished.filter((p) => p.pointsEarned === 100).length;
  const winnerOnly = finished.filter((p) => p.pointsEarned === 50).length;
  const accuracy =
    finished.length > 0
      ? Math.round(((perfectScores + winnerOnly) / finished.length) * 100)
      : 0;

  const snapshots = await RankSnapshot.find({ user: userId })
    .populate('match', 'teamA teamB stage startTime status')
    .lean();

  const rankHistory = snapshots
    .filter((s) => s.match)
    .sort((a, b) => new Date(a.match.startTime) - new Date(b.match.startTime))
    .map((s) => ({
      match: s.match,
      rank: s.rank,
      rankChange: s.rankChange,
      totalPoints: s.totalPoints,
    }));

  return {
    user: {
      _id: user._id,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      favoriteTeam: user.favoriteTeam,
      totalPoints: user.totalPoints,
      currentRank,
    },
    accuracy,
    rankHistory,
  };
}
