import mongoose from 'mongoose';

const stageScoreSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: ['r16', 'r8', 'r4', 'r2', 'winner'],
      required: true,
    },
    correctCount: { type: Number, required: true },
    maxCount: { type: Number, required: true },
    points: { type: Number, required: true },
    evaluatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pickSchema = new mongoose.Schema(
  {
    bracketMatchKey: { type: String, required: true },
    pickedTeam: { type: String, required: true },
  },
  { _id: false }
);

const userBracketSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    picks: [pickSchema],
    status: {
      type: String,
      enum: ['draft', 'locked'],
      default: 'draft',
    },
    submittedAt: { type: Date, default: null },
    bracketPoints: { type: Number, default: 0 },
    stageScores: [stageScoreSchema],
    evaluatedStages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('UserBracketSubmission', userBracketSubmissionSchema);
