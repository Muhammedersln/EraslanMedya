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
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
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
    if (!req.file) {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: [{ field: 'image', message: 'Ürün görseli zorunludur' }]
      });
    }

    const { name, description, price, category, subCategory, minQuantity, maxQuantity, active } = req.body;

    // Kategori kontrolü
    const validCategories = ['instagram', 'tiktok'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: [{ field: 'category', message: 'Geçersiz kategori' }]
      });
    }

    // Alt kategori kontrolü
    const validSubCategories = ['followers', 'likes', 'views', 'comments'];
    if (!validSubCategories.includes(subCategory)) {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: [{ field: 'subCategory', message: 'Geçersiz alt kategori' }]
      });
    }

    // Temel validasyonlar
    if (!name || !price || !category || !subCategory || !minQuantity || !maxQuantity) {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: [{ field: 'form', message: 'Tüm zorunlu alanları doldurun' }]
      });
    }

    // Yeni ürün oluştur
    const product = new Product({
      name: name.trim(),
      description: description?.trim() || '',
      price: Number(price),
      category,
      subCategory,
      minQuantity: Number(minQuantity),
      maxQuantity: Number(maxQuantity),
      image: req.file.filename,
      active: active === 'true'
    });

    await product.save();
    res.status(201).json(product);

  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({ 
      message: 'Ürün eklenirken bir hata oluştu',
      error: error.message
    });
  }
});

// Ürünleri getir
router.get('/products', adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    
    // Görsel URL'lerini düzenle
    const productsWithUrls = products.map(product => {
      const productObj = product.toObject();
      if (productObj.image) {
        // Sadece dosya adını döndür, frontend'de tam URL oluşturulacak
        productObj.image = productObj.image;
      }
      return productObj;
    });
    
    res.json(productsWithUrls);
  } catch (error) {
    console.error('Ürünler getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ürün güncelle
router.put('/products/:id', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Kategori kontrolü
    if (updateData.category && !['instagram', 'tiktok'].includes(updateData.category)) {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: [{ field: 'category', message: 'Geçersiz kategori' }]
      });
    }

    // Alt kategori kontrolü
    if (updateData.subCategory && !['followers', 'likes', 'views', 'comments'].includes(updateData.subCategory)) {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors: [{ field: 'subCategory', message: 'Geçersiz alt kategori' }]
      });
    }

    if (req.file) {
      // Eski görseli sil
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', 'uploads', oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      updateData.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    res.json(product);
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    
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

// Test endpoint'i
router.get('/test-image/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Görsel bulunamadı' });
  }
});

module.exports = router; 