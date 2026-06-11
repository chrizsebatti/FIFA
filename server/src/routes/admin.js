import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import User from '../models/User.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { getWinner, scoreMatch } from '../services/scoring.js';
import { isLocked } from '../services/predictionLock.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

router.get('/matches', adminAuth, async (req, res, next) => {
  try {
    const matches = await Match.find().sort({ startTime: 1 });
    res.json({
      matches: matches.map((m) => ({
        ...m.toObject(),
        isLocked: isLocked(m),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/matches', adminAuth, async (req, res, next) => {
  try {
    const { teamA, teamB, startTime, stage } = req.body;
    if (!teamA?.trim() || !teamB?.trim() || !startTime) {
      return res.status(400).json({ error: 'teamA, teamB, and startTime are required' });
    }

    const match = await Match.create({
      teamA: teamA.trim(),
      teamB: teamB.trim(),
      startTime: new Date(startTime),
      stage: stage?.trim() || '',
    });

    res.status(201).json({ match });
  } catch (err) {
    next(err);
  }
});

router.put('/matches/:id', adminAuth, async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const { teamA, teamB, startTime, stage, scoreA, scoreB } = req.body;

    if (teamA) match.teamA = teamA.trim();
    if (teamB) match.teamB = teamB.trim();
    if (startTime) match.startTime = new Date(startTime);
    if (stage !== undefined) match.stage = stage.trim();

    const enteringResult = scoreA != null && scoreB != null;
    if (enteringResult) {
      const scoreANum = Number(scoreA);
      const scoreBNum = Number(scoreB);
      if (scoreANum < 0 || scoreBNum < 0) {
        return res.status(400).json({ error: 'Scores must be non-negative' });
      }
      match.scoreA = scoreANum;
      match.scoreB = scoreBNum;
      match.winner = getWinner(match.teamA, match.teamB, scoreANum, scoreBNum);
      match.status = 'finished';
    }

    await match.save();

    if (enteringResult) {
      await scoreMatch(match);
    }

    res.json({ match: { ...match.toObject(), isLocked: isLocked(match) } });
  } catch (err) {
    next(err);
  }
});

router.delete('/matches/:id', adminAuth, async (req, res, next) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    await Prediction.deleteMany({ match: match._id });
    res.json({ message: 'Match deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/predictions', adminAuth, async (req, res, next) => {
  try {
    const predictions = await Prediction.find()
      .populate('user', 'phoneNumber displayName')
      .populate('match', 'teamA teamB stage startTime status')
      .sort({ createdAt: -1 });

    res.json({ predictions });
  } catch (err) {
    next(err);
  }
});

router.get('/users', adminAuth, async (req, res, next) => {
  try {
    const users = await User.find().sort({ totalPoints: -1, createdAt: 1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

export default router;
