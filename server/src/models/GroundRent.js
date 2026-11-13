import mongoose from 'mongoose';

const groundRentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
  },
  { timestamps: true }
);

groundRentSchema.index({ member: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('GroundRent', groundRentSchema);
