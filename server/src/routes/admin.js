import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { importPredictions } from '../services/bulkPredictionImport.js';
import { normalizeImportRows, parseImportPayload } from '../services/bulkImport.js';
import { getPointsReason, getWinner, scoreMatch } from '../services/scoring.js';
import { isLocked } from '../services/predictionLock.js';
import { normalizeTeamColor } from '../utils/teamColor.js';
import { normalizeTeamEmoji } from '../utils/teamEmoji.js';
import BracketMatch from '../models/BracketMatch.js';
import UserBracketSubmission from '../models/UserBracketSubmission.js';
import { getBracketConfig } from '../models/BracketConfig.js';
import { seedBracketMatches } from '../services/bracketSeed.js';
import {
  evaluateStage,
  getRoundCompletionStatus,
  maybeEvaluateAfterWinner,
  syncAllBracketPoints,
  syncR32Complete,
} from '../services/bracketScoring.js';
import { resolveMatchTeams } from '../services/bracketResolver.js';
import { BRACKET_STAGES } from '../services/bracketTopology.js';

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

router.post('/matches/bulk', adminAuth, async (req, res, next) => {
  try {
    const { format, data } = req.body;
    if (!format || data == null) {
      return res.status(400).json({ error: 'format and data are required' });
    }

    let rows;
    try {
      rows = parseImportPayload({ format, data });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No matches to import' });
    }

    let normalized;
    try {
      normalized = normalizeImportRows(rows);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const created = await Match.insertMany(normalized);

    for (const match of created) {
      if (match.status === 'finished') {
        await scoreMatch(match);
      }
    }

    res.status(201).json({
      imported: created.length,
      finished: created.filter((m) => m.status === 'finished').length,
      upcoming: created.filter((m) => m.status !== 'finished').length,
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

router.post('/predictions/bulk', adminAuth, async (req, res, next) => {
  try {
    const { format, data } = req.body;
    if (!format || data == null) {
      return res.status(400).json({ error: 'format and data are required' });
    }

    const result = await importPredictions({ format, data });
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes('JSON') || err.message.includes('CSV') || err.message.includes('import')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.get('/predictions', adminAuth, async (req, res, next) => {
  try {
    const predictions = await Prediction.find()
      .populate('user', 'phoneNumber displayName')
      .populate('match', 'teamA teamB stage startTime status scoreA scoreB winner')
      .sort({ createdAt: -1 });

    res.json({
      predictions: predictions.map((p) => ({
        ...p.toObject(),
        reason: getPointsReason(p, p.match),
      })),
    });
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

router.get('/users/statistics', adminAuth, async (req, res, next) => {
  try {
    const users = await User.find().sort({ totalPoints: -1, createdAt: 1 });

    const statistics = await Promise.all(
      users.map(async (user) => {
        const predictions = await Prediction.find({ user: user._id })
          .populate('match')
          .sort({ createdAt: -1 });

        const breakdown = predictions.map((p) => ({
          predictionId: p._id,
          match: p.match
            ? {
                _id: p.match._id,
                teamA: p.match.teamA,
                teamB: p.match.teamB,
                stage: p.match.stage,
                status: p.match.status,
                scoreA: p.match.scoreA,
                scoreB: p.match.scoreB,
                winner: p.match.winner,
              }
            : null,
          predictedWinner: p.predictedWinner,
          predictedScoreA: p.scoreA,
          predictedScoreB: p.scoreB,
          pointsEarned: p.pointsEarned,
          reason: getPointsReason(p, p.match),
        }));

        const finished = breakdown.filter((b) => b.match?.status === 'finished');

        return {
          user: {
            _id: user._id,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            totalPoints: user.totalPoints,
          },
          summary: {
            totalPredictions: breakdown.length,
            pending: breakdown.filter((b) => b.match?.status !== 'finished').length,
            perfectScores: finished.filter((b) => b.pointsEarned === 100).length,
            winnerOnly: finished.filter((b) => b.pointsEarned === 50).length,
            incorrect: finished.filter((b) => b.pointsEarned === 0).length,
          },
          breakdown,
        };
      })
    );

    res.json({ statistics });
  } catch (err) {
    next(err);
  }
});

router.get('/teams', adminAuth, async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

router.post('/teams', adminAuth, async (req, res, next) => {
  try {
    const { name, color, emoji } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    const normalizedColor = normalizeTeamColor(color);
    if (color && normalizedColor === null) {
      return res.status(400).json({ error: 'Invalid team color. Use hex format like #FF6D00' });
    }
    const team = await Team.create({
      name: name.trim(),
      color: normalizedColor,
      emoji: normalizeTeamEmoji(emoji),
    });
    res.status(201).json({ team });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Team already exists' });
    }
    next(err);
  }
});

router.put('/teams/:id', adminAuth, async (req, res, next) => {
  try {
    const { name, color, emoji, isActive } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    if (name?.trim()) {
      team.name = name.trim();
    }
    if (color !== undefined) {
      const normalizedColor = normalizeTeamColor(color);
      if (normalizedColor === null) {
        return res.status(400).json({ error: 'Invalid team color. Use hex format like #FF6D00' });
      }
      team.color = normalizedColor;
    }
    if (emoji !== undefined) {
      team.emoji = normalizeTeamEmoji(emoji);
    }
    if (isActive !== undefined) {
      team.isActive = Boolean(isActive);
    }
    await team.save();
    res.json({ team });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    next(err);
  }
});

router.delete('/teams/:id', adminAuth, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    team.isActive = false;
    await team.save();
    res.json({ team });
  } catch (err) {
    next(err);
  }
});

router.post('/bracket/seed', adminAuth, async (req, res, next) => {
  try {
    const result = await seedBracketMatches();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/bracket', adminAuth, async (req, res, next) => {
  try {
    const [matches, config, lockedCount] = await Promise.all([
      BracketMatch.find().sort({ round: 1, matchIndex: 1 }).lean(),
      getBracketConfig(),
      UserBracketSubmission.countDocuments({ status: 'locked' }),
    ]);

    const matchesByKey = new Map(matches.map((m) => [m.key, m]));
    const resolved = matches.map((match) => {
      const { teamA, teamB } = resolveMatchTeams(match, matchesByKey, new Map(), true);
      return { ...match, resolvedTeamA: teamA, resolvedTeamB: teamB };
    });

    res.json({
      matches: resolved,
      config,
      lockedSubmissions: lockedCount,
      roundStatus: getRoundCompletionStatus(matches),
    });
  } catch (err) {
    next(err);
  }
});

router.put('/bracket/r32/:key', adminAuth, async (req, res, next) => {
  try {
    const { teamA, teamB } = req.body;
    const match = await BracketMatch.findOne({ key: req.params.key, round: 'r32' });
    if (!match) {
      return res.status(404).json({ error: 'R32 match not found' });
    }

    const lockedCount = await UserBracketSubmission.countDocuments({ status: 'locked' });
    if (lockedCount > 0) {
      return res.status(400).json({ error: 'Cannot edit R32 after customers have submitted brackets' });
    }

    if (teamA !== undefined) {
      if (teamA) {
        const team = await Team.findOne({ name: teamA.trim(), isActive: true });
        if (!team) return res.status(400).json({ error: `Team not found: ${teamA}` });
        match.teamA = team.name;
      } else {
        match.teamA = null;
      }
    }
    if (teamB !== undefined) {
      if (teamB) {
        const team = await Team.findOne({ name: teamB.trim(), isActive: true });
        if (!team) return res.status(400).json({ error: `Team not found: ${teamB}` });
        match.teamB = team.name;
      } else {
        match.teamB = null;
      }
    }

    await match.save();
    const config = await syncR32Complete();

    res.json({ match, config });
  } catch (err) {
    next(err);
  }
});

router.put('/bracket/:key/winner', adminAuth, async (req, res, next) => {
  try {
    const { winner } = req.body;
    const matches = await BracketMatch.find().lean();
    const match = matches.find((m) => m.key === req.params.key);
    if (!match) {
      return res.status(404).json({ error: 'Bracket match not found' });
    }

    const matchesByKey = new Map(matches.map((m) => [m.key, m]));
    const { teamA, teamB } = resolveMatchTeams(match, matchesByKey, new Map(), true);

    if (!teamA || !teamB) {
      return res.status(400).json({ error: 'Both teams must be set before recording a winner' });
    }
    if (winner !== teamA && winner !== teamB) {
      return res.status(400).json({ error: `Winner must be ${teamA} or ${teamB}` });
    }

    const updated = await BracketMatch.findOneAndUpdate(
      { key: req.params.key },
      { actualWinner: winner },
      { new: true }
    );

    const evalResult = await maybeEvaluateAfterWinner(req.params.key);

    res.json({
      match: updated,
      evaluation: evalResult,
      roundStatus: getRoundCompletionStatus(
        await BracketMatch.find().lean()
      ),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/bracket/evaluate/:stage', adminAuth, async (req, res, next) => {
  try {
    const { stage } = req.params;
    if (!BRACKET_STAGES.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }
    const result = await evaluateStage(stage);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/bracket/sync', adminAuth, async (req, res, next) => {
  try {
    const result = await syncAllBracketPoints();
    res.json({
      ...result,
      roundStatus: getRoundCompletionStatus(await BracketMatch.find().lean()),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
