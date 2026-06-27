import { Router } from 'express';
import BracketMatch from '../models/BracketMatch.js';
import { getBracketConfig } from '../models/BracketConfig.js';
import User from '../models/User.js';
import UserBracketSubmission from '../models/UserBracketSubmission.js';
import { auth } from '../middleware/auth.js';
import {
  buildResolvedBracket,
  picksToMap,
  validateSubmissionPicks,
} from '../services/bracketResolver.js';
import { STAGE_LABELS } from '../services/bracketTopology.js';

const router = Router();

function maskPhone(phone) {
  if (!phone || phone.length < 4) return '****';
  return `***${phone.slice(-4)}`;
}

router.get('/', auth, async (req, res, next) => {
  try {
    const [matches, config, submission] = await Promise.all([
      BracketMatch.find().sort({ round: 1, matchIndex: 1 }).lean(),
      getBracketConfig(),
      UserBracketSubmission.findOne({ user: req.userId }).lean(),
    ]);

    const picksMap = picksToMap(submission?.picks || []);
    const resolved = buildResolvedBracket(matches, picksMap, false);

    res.json({
      config: {
        r32Complete: config.r32Complete,
        predictionsEnabled: config.predictionsEnabled,
      },
      matches: resolved,
      submission: submission
        ? {
            status: submission.status,
            picks: submission.picks,
            bracketPoints: submission.bracketPoints,
            stageScores: submission.stageScores,
            submittedAt: submission.submittedAt,
          }
        : null,
      stageLabels: STAGE_LABELS,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/picks', auth, async (req, res, next) => {
  try {
    const config = await getBracketConfig();
    if (!config.predictionsEnabled) {
      return res.status(400).json({ error: 'Bracket predictions are not open yet' });
    }

    let submission = await UserBracketSubmission.findOne({ user: req.userId });
    if (submission?.status === 'locked') {
      return res.status(400).json({ error: 'Bracket is locked and cannot be edited' });
    }

    const { picks } = req.body;
    if (!Array.isArray(picks)) {
      return res.status(400).json({ error: 'picks array is required' });
    }

    if (!submission) {
      submission = await UserBracketSubmission.create({
        user: req.userId,
        picks,
        status: 'draft',
      });
    } else {
      submission.picks = picks;
      await submission.save();
    }

    res.json({ submission });
  } catch (err) {
    next(err);
  }
});

router.post('/submit', auth, async (req, res, next) => {
  try {
    const config = await getBracketConfig();
    if (!config.predictionsEnabled) {
      return res.status(400).json({ error: 'Bracket predictions are not open yet' });
    }

    const [matches, submission] = await Promise.all([
      BracketMatch.find().lean(),
      UserBracketSubmission.findOne({ user: req.userId }),
    ]);

    if (!submission) {
      return res.status(400).json({ error: 'No bracket picks to submit' });
    }
    if (submission.status === 'locked') {
      return res.status(400).json({ error: 'Bracket already submitted' });
    }

    const validationError = validateSubmissionPicks(matches, submission.picks);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    submission.status = 'locked';
    submission.submittedAt = new Date();
    await submission.save();

    res.json({ submission });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', auth, async (req, res, next) => {
  try {
    const allUsers = await User.find()
      .sort({ bracketPoints: -1, createdAt: 1 })
      .limit(50)
      .select('displayName phoneNumber bracketPoints');

    res.json({
      leaderboard: allUsers.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        displayName: user.displayName || maskPhone(user.phoneNumber),
        maskedPhone: maskPhone(user.phoneNumber),
        bracketPoints: user.bracketPoints,
        isMe: user._id.toString() === req.userId,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
