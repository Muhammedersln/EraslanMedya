const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  taxRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.18
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Sadece tek bir ayar kaydı olmasını sağlayacak static method
settingsSchema.statics.getSettings = async function() {
  try {
    let settings = await this.findOne();
    if (!settings) {
      settings = await this.create({ 
        taxRate: 0.18,
        updatedAt: new Date()
      });
    }
    return settings;
  } catch (error) {
    console.error('Settings.getSettings error:', error);
    throw new Error('Ayarlar alınırken bir hata oluştu');
  }
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;