import { Router } from 'express';
import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import { auth } from '../middleware/auth.js';
import { isLocked } from '../services/predictionLock.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const matches = await Match.find().sort({ startTime: 1 });
    res.json({ matches: matches.map((m) => formatMatch(m)) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json({ match: formatMatch(match) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/my-prediction', auth, async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    const prediction = await Prediction.findOne({
      user: req.userId,
      match: match._id,
    });
    res.json({
      match: formatMatch(match),
      prediction,
    });
  } catch (err) {
    next(err);
  }
});

function formatMatch(match) {
  return {
    ...match.toObject(),
    isLocked: isLocked(match),
  };
}

export default router;
