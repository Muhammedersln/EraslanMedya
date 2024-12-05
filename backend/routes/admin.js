const router = require('express').Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dosya yükleme için multer ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    // Eğer uploads dizini yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Sadece resim dosyalarına izin ver
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Görsel yükleme endpoint'i
router.post('/upload', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir görsel seçin' });
    }

    // Dosya yolunu döndür
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    res.status(500).json({ message: 'Görsel yüklenirken bir hata oluştu' });
  }
});

// Kullanıcıları getir
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı sil
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kullanıcı silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ürün ekle
router.post('/products', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('Gelen request body:', req.body);
    console.log('Gelen dosya:', req.file);

    const { name, description, price, category, minQuantity, maxQuantity, active } = req.body;
    
    // Gelen verileri kontrol et
    if (!name || !description || !price || !category || !minQuantity || !maxQuantity) {
      console.log('Eksik alanlar:', {
        name: !name,
        description: !description,
        price: !price,
        category: !category,
        minQuantity: !minQuantity,
        maxQuantity: !maxQuantity
      });
      return res.status(400).json({ 
        message: 'Tüm alanlar zorunludur',
        missingFields: {
          name: !name,
          description: !description,
          price: !price,
          category: !category,
          minQuantity: !minQuantity,
          maxQuantity: !maxQuantity
        }
      });
    }

    // Dosya kontrolü
    if (!req.file) {
      console.log('Dosya yok!');
      return res.status(400).json({ message: 'Ürün görseli zorunludur' });
    }

    // Sayısal değerlerin kontrolü
    if (isNaN(Number(price)) || isNaN(Number(minQuantity)) || isNaN(Number(maxQuantity))) {
      console.log('Geçersiz sayısal değerler:', {
        price: isNaN(Number(price)),
        minQuantity: isNaN(Number(minQuantity)),
        maxQuantity: isNaN(Number(maxQuantity))
      });
      return res.status(400).json({ 
        message: 'Geçersiz sayısal değerler',
        invalidFields: {
          price: isNaN(Number(price)),
          minQuantity: isNaN(Number(minQuantity)),
          maxQuantity: isNaN(Number(maxQuantity))
        }
      });
    }

    // Kategori kontrolü
    const validCategories = ['instagram', 'tiktok', 'youtube'];
    if (!validCategories.includes(category)) {
      console.log('Geçersiz kategori:', category);
      return res.status(400).json({ 
        message: 'Geçersiz kategori',
        validCategories
      });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('Oluşturulan görsel URL:', imageUrl);

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      minQuantity: Number(minQuantity),
      maxQuantity: Number(maxQuantity),
      image: imageUrl,
      active: active === 'true'
    });

    console.log('Oluşturulan ürün:', product);

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    
    // Mongoose validasyon hatası kontrolü
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Diğer hatalar için
    res.status(500).json({ 
      message: 'Ürün eklenirken bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Ürünleri getir
router.get('/products', adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ürün güncelle
router.put('/products/:id', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      // Eski görseli sil
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Yeni görsel yolunu ekle
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ürün sil
router.delete('/products/:id', adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Siparişleri getir
router.get('/orders', adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('product', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Sipariş durumunu güncelle
router.put('/orders/:id/status', adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// İstatistikleri getir
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      userCount,
      productCount,
      orderCount,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 