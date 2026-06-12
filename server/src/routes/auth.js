import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { auth, attachUser } from '../middleware/auth.js';
import { buildProfile } from '../services/profile.js';

const router = Router();

router.post('/join', async (req, res, next) => {
  try {
    const { phoneNumber, displayName } = req.body;
    if (!phoneNumber?.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const normalized = phoneNumber.trim();
    let user = await User.findOne({ phoneNumber: normalized });
    if (!user) {
      user = await User.create({
        phoneNumber: normalized,
        displayName: displayName?.trim() || '',
      });
    } else if (displayName?.trim()) {
      user.displayName = displayName.trim();
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const populated = await User.findById(user._id).populate('favoriteTeam', 'name');
    res.json({ token, user: populated });
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, attachUser, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/me', auth, attachUser, async (req, res, next) => {
  try {
    const { displayName, favoriteTeam } = req.body;

    if (displayName !== undefined) {
      req.user.displayName = String(displayName).trim();
    }

    if (favoriteTeam !== undefined) {
      if (favoriteTeam === null || favoriteTeam === '') {
        req.user.favoriteTeam = null;
      } else {
        const team = await Team.findOne({ _id: favoriteTeam, isActive: true });
        if (!team) {
          return res.status(400).json({ error: 'Invalid favorite team' });
        }
        req.user.favoriteTeam = team._id;
      }
    }

    await req.user.save();
    const user = await User.findById(req.user._id).populate('favoriteTeam', 'name');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.get('/me/profile', auth, async (req, res, next) => {
  try {
    const profile = await buildProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
