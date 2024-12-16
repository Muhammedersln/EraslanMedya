const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiter ayarları
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına maksimum 5 deneme
  message: { message: 'Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' }
});

// Kayıt olma
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, username, password } = req.body;

    // Input validasyonu
    if (!firstName || !lastName || !email || !phone || !username || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Kullanıcı adı ve email kontrolü
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        message: userExists.email === email 
          ? 'Bu e-posta adresi zaten kullanımda' 
          : 'Bu kullanıcı adı zaten kullanımda'
      });
    }

    // Şifreyi hashleme
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // E-posta doğrulama token'ı oluştur
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Yeni kullanıcı oluşturma
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      username,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 saat
    });

    await user.save();

    // Token oluşturma
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        emailVerificationToken: verificationToken // Frontend'e token'ı gönder
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        status: 'error',
        message: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      status: 'error',
      message: 'Sunucu hatası oluştu'
    });
  }
});

// Giriş yapma
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Kullanıcı adı ve şifre zorunludur' 
      });
    }

    // Kullanıcıyı bulma
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Kullanıcı adı veya şifre hatalı' 
      });
    }

    // Şifre kontrolü
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Başarısız giriş denemelerini artır
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + (15 * 60 * 1000); // 15 dakika kilitle
      }
      await user.save();

      return res.status(400).json({ 
        status: 'error',
        message: 'Kullanıcı adı veya şifre hatalı'
      });
    }

    // Hesap kilitli mi kontrol et
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(400).json({
        status: 'error',
        message: 'Hesabınız kilitlendi. Lütfen daha sonra tekrar deneyin.'
      });
    }

    // Admin değilse e-posta doğrulama kontrolü yap
    if (user.role !== 'admin' && !user.isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Lütfen önce e-posta adresinizi doğrulayın'
      });
    }

    // Başarılı giriş - login bilgilerini sıfırla
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = Date.now();
    await user.save();

    // Token oluşturma
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Sunucu hatası oluştu'
    });
  }
});

// Kullanıcı bilgilerini getir
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Yetkilendirme token\'ı bulunamadı' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Kullanıcı bulunamadı' 
      });
    }

    if (!user.active) {
      return res.status(401).json({
        status: 'error',
        message: 'Hesabınız devre dışı bırakılmış'
      });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Geçersiz token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Token süresi dolmuş' 
      });
    }
    res.status(500).json({ 
      status: 'error',
      message: 'Sunucu hatası oluştu'
    });
  }
});

// E-posta doğrulama
router.post('/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        status: 'error',
        message: 'Email ve token gereklidir'
      });
    }

    try {
      // Base64 token'ı decode et
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const { email: tokenEmail, exp } = decoded;

      // Token'ın geçerliliğini kontrol et
      if (exp < Math.floor(Date.now() / 1000)) {
        return res.status(400).json({
          status: 'error',
          message: 'Doğrulama bağlantısının süresi dolmuş'
        });
      }

      // Email eşleşmesini kontrol et
      if (tokenEmail !== email) {
        return res.status(400).json({
          status: 'error',
          message: 'Geçersiz doğrulama bağlantısı'
        });
      }

      // Kullanıcıyı bul
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Kullanıcı bulunamadı'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          status: 'error',
          message: 'E-posta adresi zaten doğrulanmış'
        });
      }

      // E-posta durumunu güncelle
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.json({
        status: 'success',
        message: 'E-posta başarıyla doğrulandı'
      });
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Geçersiz doğrulama bağlantısı'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Doğrulama işlemi sırasında bir hata oluştu'
    });
  }
});

// Şifre sıfırlama isteği
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'E-posta adresi gereklidir'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı'
      });
    }

    // Şifre sıfırlama token'ı oluştur
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Token'ı kullanıcı belgesine kaydet
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    res.json({
      status: 'success',
      message: 'Şifre sıfırlama bağlantısı gönderildi',
      resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu'
    });
  }
});

// Şifre sıfırlama
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Tüm alanlar zorunludur'
      });
    }

    // Token'ı doğrula
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı'
      });
    }

    // Yeni şifreyi hashleme
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Kullanıcı bilgilerini güncelle
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      status: 'success',
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu'
    });
  }
});

module.exports = router; 