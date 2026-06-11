import { Router } from 'express';
import User from '../models/User.js';

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

    res.json({
      leaderboard: users.map((user, index) => ({
        rank: index + 1,
        displayName: user.displayName || maskPhone(user.phoneNumber),
        maskedPhone: maskPhone(user.phoneNumber),
        totalPoints: user.totalPoints,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
