import { Router } from 'express';
import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import { auth } from '../middleware/auth.js';
import { isLocked } from '../services/predictionLock.js';

const router = Router();

router.get('/me', auth, async (req, res, next) => {
  try {
    const predictions = await Prediction.find({ user: req.userId })
      .populate('match')
      .sort({ createdAt: -1 });

    res.json({
      predictions: predictions.map((p) => ({
        ...p.toObject(),
        match: p.match
          ? { ...p.match.toObject(), isLocked: isLocked(p.match) }
          : null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { matchId, predictedWinner, scoreA, scoreB } = req.body;

    if (!matchId || predictedWinner == null || scoreA == null || scoreB == null) {
      return res.status(400).json({ error: 'All prediction fields are required' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (isLocked(match)) {
      return res.status(403).json({ error: 'Predictions are closed for this match' });
    }

    const validWinners = [match.teamA, match.teamB, 'draw'];
    if (!validWinners.includes(predictedWinner)) {
      return res.status(400).json({ error: 'Invalid predicted winner' });
    }

    const scoreANum = Number(scoreA);
    const scoreBNum = Number(scoreB);
    if (scoreANum < 0 || scoreBNum < 0 || !Number.isInteger(scoreANum) || !Number.isInteger(scoreBNum)) {
      return res.status(400).json({ error: 'Scores must be non-negative integers' });
    }

    const prediction = await Prediction.findOneAndUpdate(
      { user: req.userId, match: matchId },
      {
        predictedWinner,
        scoreA: scoreANum,
        scoreB: scoreBNum,
        pointsEarned: 0,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ prediction });
  } catch (err) {
    next(err);
  }
});

export default router;
