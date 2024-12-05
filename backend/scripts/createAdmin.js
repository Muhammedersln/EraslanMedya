const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eraslanmedya', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB bağlantısı başarılı');

    // Admin bilgileri
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@eraslanmedya.com',
      phone: '5555555555',
      username: 'admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin'
    };

    // Eğer admin kullanıcısı varsa güncelle, yoksa oluştur
    const admin = await User.findOneAndUpdate(
      { username: adminData.username },
      adminData,
      { upsert: true, new: true }
    );

    console.log('Admin kullanıcısı oluşturuldu:', {
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

createAdmin(); 