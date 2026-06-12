import mongoose from 'mongoose';

const rankSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    rankChange: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

rankSnapshotSchema.index({ user: 1, match: 1 }, { unique: true });

export default mongoose.model('RankSnapshot', rankSnapshotSchema);
