import mongoose from 'mongoose';

const financeCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('FinanceCategory', financeCategorySchema);
