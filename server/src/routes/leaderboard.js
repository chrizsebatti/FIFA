import { Router } from 'express';
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

export default router;
