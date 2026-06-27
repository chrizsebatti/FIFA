import BracketMatch from '../models/BracketMatch.js';
import User from '../models/User.js';
import UserBracketSubmission from '../models/UserBracketSubmission.js';
import {
  countStageIntersection,
  getTeamsAtStage,
  isRoundResultsComplete,
  picksToMap,
} from './bracketResolver.js';
import {
  ROUND_TO_STAGE,
  STAGE_MAX_TEAMS,
  BRACKET_STAGES,
} from './bracketTopology.js';

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'];

const STAGE_REQUIRES_ROUND = {
  r16: 'r32',
  r8: 'r16',
  r4: 'qf',
  r2: 'sf',
  winner: 'final',
};

function scoreStageForSubmission(matches, picksMap, stage) {
  const actualTeams = getTeamsAtStage(matches, new Map(), stage, true);
  if (actualTeams.length === 0) return null;

  const userTeams = getTeamsAtStage(matches, picksMap, stage, false);

  let correctCount;
  let points;

  if (stage === 'winner') {
    correctCount =
      userTeams[0] && actualTeams[0] && userTeams[0] === actualTeams[0] ? 1 : 0;
    points = correctCount * 10;
  } else {
    correctCount = countStageIntersection(userTeams, actualTeams);
    points = correctCount * 10;
  }

  return {
    stage,
    correctCount,
    maxCount: STAGE_MAX_TEAMS[stage],
    points,
    evaluatedAt: new Date(),
  };
}

export async function evaluateStage(stage) {
  const matches = await BracketMatch.find().lean();
  const submissions = await UserBracketSubmission.find({ status: 'locked' });

  const actualTeams = getTeamsAtStage(matches, new Map(), stage, true);
  if (actualTeams.length === 0) {
    return { evaluated: 0, stage, skipped: true, reason: 'No actual teams yet' };
  }

  let evaluated = 0;

  for (const submission of submissions) {
    if (submission.evaluatedStages.includes(stage)) continue;

    const picksMap = picksToMap(submission.picks);
    const scored = scoreStageForSubmission(matches, picksMap, stage);
    if (!scored) continue;

    submission.stageScores.push(scored);
    submission.evaluatedStages.push(stage);
    submission.bracketPoints += scored.points;
    await submission.save();

    await User.findByIdAndUpdate(submission.user, {
      $inc: { bracketPoints: scored.points },
    });

    evaluated += 1;
  }

  return { evaluated, stage, skipped: false };
}

export async function maybeEvaluateAfterWinner(matchKey) {
  const matches = await BracketMatch.find().lean();
  const match = matches.find((m) => m.key === matchKey);
  if (!match || !match.actualWinner) return null;

  const round = match.round;
  if (!isRoundResultsComplete(matches, round)) return null;

  const stage = ROUND_TO_STAGE[round];
  if (!stage) return null;

  return evaluateStage(stage);
}

export async function syncAllBracketPoints() {
  const matches = await BracketMatch.find().lean();
  const submissions = await UserBracketSubmission.find({ status: 'locked' });

  const stagesSynced = [];
  let usersUpdated = 0;

  for (const submission of submissions) {
    const picksMap = picksToMap(submission.picks);

    submission.bracketPoints = 0;
    submission.stageScores = [];
    submission.evaluatedStages = [];

    for (const stage of BRACKET_STAGES) {
      const requiredRound = STAGE_REQUIRES_ROUND[stage];
      if (!isRoundResultsComplete(matches, requiredRound)) continue;

      const scored = scoreStageForSubmission(matches, picksMap, stage);
      if (!scored) continue;

      submission.stageScores.push(scored);
      submission.evaluatedStages.push(stage);
      submission.bracketPoints += scored.points;

      if (!stagesSynced.includes(stage)) {
        stagesSynced.push(stage);
      }
    }

    await submission.save();
    await User.findByIdAndUpdate(submission.user, {
      bracketPoints: submission.bracketPoints,
    });

    usersUpdated += 1;
  }

  return {
    usersUpdated,
    stagesSynced,
    totalPointsAwarded: submissions.reduce((sum, s) => sum + (s.bracketPoints || 0), 0),
  };
}

export async function syncR32Complete() {
  const { getBracketConfig } = await import('../models/BracketConfig.js');
  const matches = await BracketMatch.find({ round: 'r32' }).lean();
  const complete = matches.length === 16 && matches.every((m) => m.teamA && m.teamB);

  const config = await getBracketConfig();
  config.r32Complete = complete;
  config.predictionsEnabled = complete;
  await config.save();
  return config;
}

export function getRoundCompletionStatus(matches) {
  return ROUND_ORDER.reduce((acc, round) => {
    acc[round] = {
      total: matches.filter((m) => m.round === round).length,
      withWinner: matches.filter((m) => m.round === round && m.actualWinner).length,
      complete: isRoundResultsComplete(matches, round),
      evaluatedStage: ROUND_TO_STAGE[round] || null,
    };
    return acc;
  }, {});
}
