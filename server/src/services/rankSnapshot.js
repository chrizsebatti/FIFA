import mongoose from 'mongoose';
import User from '../models/User.js';
import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import RankSnapshot from '../models/RankSnapshot.js';

export async function computeLeaderboard() {
  return User.find().sort({ totalPoints: -1, createdAt: 1 });
}

export async function computeLeaderboardAsOf(asOfMatch) {
  const finishedMatches = await Match.find({
    status: 'finished',
    startTime: { $lte: asOfMatch.startTime },
  }).select('_id');

  const matchIds = finishedMatches.map((m) => m._id);
  const users = await User.find().lean();

  const ranked = await Promise.all(
    users.map(async (user) => {
      const result = await Prediction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(user._id),
            match: { $in: matchIds },
          },
        },
        { $group: { _id: null, total: { $sum: '$pointsEarned' } } },
      ]);
      return {
        _id: user._id,
        totalPoints: result[0]?.total || 0,
        createdAt: user.createdAt,
      };
    })
  );

  ranked.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return ranked;
}

async function getPreviousRank(userId, currentMatch) {
  const snapshots = await RankSnapshot.find({ user: userId })
    .populate('match', 'startTime')
    .lean();

  const prior = snapshots
    .filter((s) => s.match && new Date(s.match.startTime) < new Date(currentMatch.startTime))
    .sort((a, b) => new Date(b.match.startTime) - new Date(a.match.startTime))[0];

  return prior?.rank ?? null;
}

export async function getLatestRankChangesForUsers(userIds) {
  if (!userIds.length) return new Map();

  const snapshots = await RankSnapshot.find({ user: { $in: userIds } })
    .populate('match', 'teamA teamB stage startTime')
    .lean();

  const latestByUser = new Map();

  for (const snap of snapshots) {
    if (!snap.match) continue;
    const uid = snap.user.toString();
    const existing = latestByUser.get(uid);
    if (
      !existing ||
      new Date(snap.match.startTime) > new Date(existing.match.startTime)
    ) {
      latestByUser.set(uid, snap);
    }
  }

  return latestByUser;
}

export async function snapshotLeaderboardRanks(matchId) {
  const match = await Match.findById(matchId);
  if (!match) return;

  const users = await computeLeaderboardAsOf(match);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const rank = i + 1;
    const previousRank = await getPreviousRank(user._id, match);
    const rankChange = previousRank != null ? previousRank - rank : 0;

    await RankSnapshot.findOneAndUpdate(
      { user: user._id, match: matchId },
      {
        rank,
        totalPoints: user.totalPoints,
        rankChange,
      },
      { upsert: true, new: true }
    );
  }
}
