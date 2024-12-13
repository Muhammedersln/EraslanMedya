const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar için public klasörü
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes - Sıralama önemli!
app.use('/api/settings', require('./routes/settings'));
app.use('/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/support'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation hatası
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // JWT hatası
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  // Genel hata
  res.status(err.status || 500).json({
    message: err.message || 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Port ayarı
const PORT = process.env.PORT || 5000;

const Settings = require('./models/Settings');

// Uygulama başlatıldığında ayarları kontrol et
const initializeSettings = async () => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({
        taxRate: 0.18,
        updatedAt: new Date()
      });
      console.log('Varsayılan ayarlar oluşturuldu');
    }
  } catch (error) {
    console.error('Ayarlar başlatılırken hata:', error);
  }
};

// Server başlatılmadan önce ayarları kontrol et
app.listen(PORT, async () => {
  await initializeSettings();
  console.log(`Server is running on port ${PORT}`);
}); 