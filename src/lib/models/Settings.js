import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  taxRate: {
    type: Number,
    required: [true, 'Tax rate is required'],
    min: [0, 'Tax rate cannot be negative'],
    max: [1, 'Tax rate cannot be greater than 1'],
    default: 0.18
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  const Settings = this.constructor;
  if (this.isNew) {
    const count = await Settings.countDocuments();
    if (count > 0) {
      next(new Error('Only one settings document can exist'));
    }
  }
  next();
});

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema); 