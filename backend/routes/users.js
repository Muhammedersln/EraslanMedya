const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Profil bilgilerini güncelle
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, username } = req.body;
    console.log('Gelen veri:', req.body); // Debug için log ekleyelim

    // Email ve kullanıcı adı benzersizlik kontrolü
    if (email !== req.user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda' });
      }
    }

    if (username !== req.user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (usernameExists) {
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanımda' });
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        email,
        phone,
        username,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şifre değiştirme
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Kullanıcıyı şifresiyle birlikte getir
    const user = await User.findById(req.user._id).select('+password');

    // Mevcut şifreyi kontrol et
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Şifreyi güncelle
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 