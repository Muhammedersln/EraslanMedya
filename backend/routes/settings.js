const router = require('express').Router();
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public endpoint - Sadece KDV oranını okuma
router.get('/tax-rate', async (req, res) => {
  try {
    let settings = await Settings.findOne().select('taxRate');
    
    if (!settings) {
      settings = await Settings.create({
        taxRate: 0.18,
        updatedAt: new Date()
      });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      taxRate: settings.taxRate
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      message: 'KDV oranı alınırken bir hata oluştu'
    });
  }
});

// Protected endpoint - Tüm ayarları getir (admin için)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        taxRate: 0.18,
        updatedAt: new Date()
      });
    }
    
    // Daha basit response formatı
    res.json({
      success: true,
      taxRate: settings.taxRate,
      updatedAt: settings.updatedAt
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar alınırken bir hata oluştu',
      error: error.message
    });
  }
});

// Admin endpoint - KDV oranını güncelle
router.post('/tax-rate', adminMiddleware, async (req, res) => {
  try {
    const { taxRate } = req.body;
    
    if (taxRate === undefined || taxRate < 0 || taxRate > 1) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir KDV oranı giriniz (0-1 arası)'
      });
    }

    let settings = await Settings.findOne();
    if (settings) {
      settings.taxRate = taxRate;
      settings.updatedAt = Date.now();
      await settings.save();
    } else {
      settings = await Settings.create({ taxRate });
    }

    res.json({
      success: true,
      message: 'KDV oranı güncellendi',
      taxRate: settings.taxRate
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'KDV oranı güncellenirken bir hata oluştu'
    });
  }
});

module.exports = router; 