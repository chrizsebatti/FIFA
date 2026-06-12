import { Router } from 'express';
import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import { auth } from '../middleware/auth.js';
import { isLocked } from '../services/predictionLock.js';
import { buildMatchDistribution } from '../services/predictionStats.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const matches = await Match.find().sort({ startTime: 1 });
    res.json({ matches: matches.map((m) => formatMatch(m)) });
  } catch (err) {
    next(err);
  }
});

function maskPhone(phone) {
  if (!phone || phone.length < 4) return '****';
  return `***${phone.slice(-4)}`;
}

router.get('/:id/participants', async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const predictions = await Prediction.find({ match: match._id })
      .populate('user', 'displayName phoneNumber')
      .sort({ pointsEarned: -1, createdAt: 1 });

    res.json({
      match: formatMatch(match),
      participants: predictions.map((p, index) => ({
        rank: index + 1,
        userId: p.user?._id,
        displayName: p.user?.displayName || maskPhone(p.user?.phoneNumber),
        maskedPhone: maskPhone(p.user?.phoneNumber),
        predictedWinner: p.predictedWinner,
        scoreA: p.scoreA,
        scoreB: p.scoreB,
        pointsEarned: p.pointsEarned,
        isWinner: p.pointsEarned > 0,
      })),
    });
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

router.get('/:id/prediction-stats', auth, async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const predictions = await Prediction.find({ match: match._id }).lean();
    const userPrediction = await Prediction.findOne({
      user: req.userId,
      match: match._id,
    }).lean();

    const { distribution, totalPredictions, favorite } = buildMatchDistribution(
      match,
      predictions
    );

    res.json({
      distribution,
      totalPredictions,
      favorite,
      userPick: userPrediction
        ? {
            predictedWinner: userPrediction.predictedWinner,
            scoreA: userPrediction.scoreA,
            scoreB: userPrediction.scoreB,
          }
        : null,
    });
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
