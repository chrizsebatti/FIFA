import mongoose from 'mongoose';

const bracketMatchSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    round: {
      type: String,
      enum: ['r32', 'r16', 'qf', 'sf', 'final'],
      required: true,
    },
    matchIndex: { type: Number, required: true },
    teamA: { type: String, default: null },
    teamB: { type: String, default: null },
    actualWinner: { type: String, default: null },
    feedsFromA: { type: String, default: null },
    feedsFromB: { type: String, default: null },
    feedsIntoKey: { type: String, default: null },
    feedsIntoSlot: { type: String, enum: ['A', 'B'], default: null },
  },
  { timestamps: true }
);

export default mongoose.model('BracketMatch', bracketMatchSchema);
