import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth, attachUser } from '../middleware/auth.js';

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

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, attachUser, (req, res) => {
  res.json({ user: req.user });
});

export default router;
