import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    bracketPoints: {
      type: Number,
      default: 0,
    },
    favoriteTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
