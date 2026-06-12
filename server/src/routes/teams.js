import { Router } from 'express';
import Team from '../models/Team.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const teams = await Team.find({ isActive: true }).sort({ name: 1 }).select('name');
    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

export default router;
