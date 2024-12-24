import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  taxRate: {
    type: Number,
    required: [true, 'Vergi oranı zorunludur'],
    min: [0, 'Vergi oranı 0\'dan küçük olamaz'],
    max: [1, 'Vergi oranı 1\'den büyük olamaz'],
    default: 0.18
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
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