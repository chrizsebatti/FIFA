import { Router } from 'express';
import mongoose from 'mongoose';
import Prediction from '../models/Prediction.js';
import User from '../models/User.js';
import { getLatestRankChangesForUsers } from '../services/rankSnapshot.js';

const router = Router();

function maskPhone(phone) {
  if (!phone || phone.length < 4) return '****';
  return `***${phone.slice(-4)}`;
}

router.get('/', async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ totalPoints: -1, createdAt: 1 })
      .limit(50)
      .select('displayName phoneNumber totalPoints');

    const userIds = users.map((u) => u._id);
    const latestChanges = await getLatestRankChangesForUsers(userIds);

    res.json({
      leaderboard: users.map((user, index) => {
        const latest = latestChanges.get(user._id.toString());
        return {
          rank: index + 1,
          userId: user._id,
          displayName: user.displayName || maskPhone(user.phoneNumber),
          maskedPhone: maskPhone(user.phoneNumber),
          totalPoints: user.totalPoints,
          rankChange: latest?.rankChange ?? null,
          lastMatch: latest?.match
            ? {
                teamA: latest.match.teamA,
                teamB: latest.match.teamB,
                stage: latest.match.stage,
              }
            : null,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:userId/points', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await User.findById(userId).select('_id displayName totalPoints');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const predictions = await Prediction.find({ user: userId })
      .populate('match', 'teamA teamB stage status startTime')
      .sort({ createdAt: -1 });

    const history = predictions
      .filter((p) => p.match)
      .map((p) => ({
        predictionId: p._id,
        match: {
          _id: p.match._id,
          teamA: p.match.teamA,
          teamB: p.match.teamB,
          stage: p.match.stage,
          status: p.match.status,
          startTime: p.match.startTime,
        },
        pointsEarned: p.pointsEarned,
      }))
      .sort((a, b) => new Date(b.match.startTime) - new Date(a.match.startTime));

    res.json({
      userId: user._id,
      totalPoints: user.totalPoints,
      history,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
