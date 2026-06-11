import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    teamA: { type: String, required: true, trim: true },
    teamB: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true },
    stage: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['upcoming', 'finished'],
      default: 'upcoming',
    },
    scoreA: { type: Number, default: null },
    scoreB: { type: Number, default: null },
    winner: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Match', matchSchema);
