import mongoose from 'mongoose';

const bracketConfigSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'config', unique: true },
    r32Complete: { type: Boolean, default: false },
    predictionsEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BracketConfig = mongoose.model('BracketConfig', bracketConfigSchema);

export default BracketConfig;

export async function getBracketConfig() {
  let config = await BracketConfig.findOne({ singleton: 'config' });
  if (!config) {
    config = await BracketConfig.create({ singleton: 'config' });
  }
  return config;
}
