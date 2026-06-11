import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedWinner: { type: String, required: true },
    scoreA: { type: Number, required: true, min: 0 },
    scoreB: { type: Number, required: true, min: 0 },
    pointsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

predictionSchema.index({ user: 1, match: 1 }, { unique: true });

export default mongoose.model('Prediction', predictionSchema);
