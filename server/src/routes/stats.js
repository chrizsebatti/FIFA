import { Router } from 'express';
import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { buildMatchDistribution } from '../services/predictionStats.js';

const router = Router();

router.get('/predictions/me', auth, async (req, res, next) => {
  try {
    const matches = await Match.find().sort({ startTime: 1 });
    const [allPredictions, userPredictions] = await Promise.all([
      Prediction.find().lean(),
      Prediction.find({ user: req.userId }).lean(),
    ]);

    const userPredByMatch = new Map(
      userPredictions.map((p) => [p.match.toString(), p])
    );

    const stats = matches.map((match) => {
      const matchId = match._id.toString();
      const matchPreds = allPredictions.filter((p) => p.match.toString() === matchId);
      const { distribution, totalPredictions, favorite } = buildMatchDistribution(
        match,
        matchPreds
      );

      const userPred = userPredByMatch.get(matchId);

      return {
        match: {
          _id: match._id,
          teamA: match.teamA,
          teamB: match.teamB,
          stage: match.stage,
          status: match.status,
          startTime: match.startTime,
        },
        distribution,
        favorite,
        userPick: userPred
          ? {
              predictedWinner: userPred.predictedWinner,
              scoreA: userPred.scoreA,
              scoreB: userPred.scoreB,
            }
          : null,
        totalPredictions,
      };
    });

    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

router.get('/fans', auth, async (req, res, next) => {
  try {
    const [teams, fanCounts, totalUsers, currentUser] = await Promise.all([
      Team.find({ isActive: true }).sort({ name: 1 }).lean(),
      User.aggregate([
        { $match: { favoriteTeam: { $ne: null } } },
        { $group: { _id: '$favoriteTeam', fanCount: { $sum: 1 } } },
      ]),
      User.countDocuments(),
      User.findById(req.userId).select('favoriteTeam').lean(),
    ]);

    const countByTeam = new Map(
      fanCounts.map((row) => [row._id.toString(), row.fanCount])
    );
    const assignedFans = fanCounts.reduce((sum, row) => sum + row.fanCount, 0);

    const teamsWithFans = teams
      .map((team) => {
        const fanCount = countByTeam.get(team._id.toString()) || 0;
        return {
          _id: team._id,
          name: team.name,
          emoji: team.emoji || '',
          color: team.color || '#FF6D00',
          fanCount,
          percentage: assignedFans
            ? Math.round((fanCount / assignedFans) * 100)
            : 0,
        };
      })
      .sort((a, b) => {
        if (b.fanCount !== a.fanCount) return b.fanCount - a.fanCount;
        return a.name.localeCompare(b.name);
      });

    res.json({
      totalUsers,
      assignedFans,
      unassignedFans: totalUsers - assignedFans,
      userFavoriteTeamId: currentUser?.favoriteTeam?.toString() || null,
      teams: teamsWithFans,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
