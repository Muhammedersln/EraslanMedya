const router = require('express').Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');
const Settings = require('../models/Settings');

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
    const products = await Product.getProductsWithTax();
    
    // Görsel URL'lerini düzenle
    const productsWithUrls = products.map(product => {
      if (product.image) {
        // Sadece dosya adını döndür, frontend'de tam URL oluşturulacak
        product.image = product.image;
      }
      return product;
    });
    
    res.json(productsWithUrls);
  } catch (error) {
    console.error('Ürünler getirilirken hata:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ürünler yüklenirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Ürün güncelle
router.put('/products/:id', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Sayısal değerleri dönüştür
    if (updateData.minQuantity) updateData.minQuantity = Number(updateData.minQuantity);
    if (updateData.maxQuantity) updateData.maxQuantity = Number(updateData.maxQuantity);
    if (updateData.price) updateData.price = Number(updateData.price);

    // Önce mevcut ürünü al
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Min-Max miktar kontrolü
    const minQuantity = updateData.minQuantity || currentProduct.minQuantity;
    const maxQuantity = updateData.maxQuantity || currentProduct.maxQuantity;

    if (maxQuantity <= minQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Maksimum miktar minimum miktardan büyük olmalıdır'
      });
    }

    // Diğer validasyonlar...
    if (updateData.category && !['instagram', 'tiktok'].includes(updateData.category)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kategori'
      });
    }

    if (updateData.subCategory && !['followers', 'likes', 'views', 'comments'].includes(updateData.subCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz alt kategori'
      });
    }

    // Görsel işleme
    if (req.file) {
      if (currentProduct.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', 'uploads', currentProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = req.file.filename;
    }

    // Ürünü güncelle
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { 
        new: true,
        runValidators: true,
        context: 'query' // Validator context'ini ayarla
      }
    );

    res.json({
      success: true,
      message: 'Ürün başarıyla güncellendi',
      product
    });
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ürün güncellenirken bir hata oluştu',
      error: error.message
    });
  }
});

// Ürün sil
router.delete('/products/:id', adminMiddleware, async (req, res) => {
  try {
    // Ürünü bul
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Ürünle ilişkili siparişleri kontrol et
    const hasOrders = await Order.exists({ product: req.params.id });
    if (hasOrders) {
      // Siparişi olan ürünleri silme, sadece deaktive et
      product.active = false;
      await product.save();
      
      return res.json({
        success: true,
        message: 'Ürün deaktive edildi (siparişleri olduğu için silinemedi)'
      });
    }

    // Ürün görselini sil
    if (product.image) {
      const imagePath = path.join(__dirname, '..', 'public', 'uploads', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Ürünü sil
    await Product.findByIdAndDelete(req.params.id);

    // Sepetlerden ürünü kaldır
    await Cart.updateMany(
      { 'items.product': req.params.id },
      { $pull: { items: { product: req.params.id } } }
    );

    res.json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });

  } catch (error) {
    console.error('Ürün silme hatası:', error);
    
    res.status(500).json({
      success: false,
      message: 'Ürün silinirken bir hata oluştu',
      error: error.message
    });
  }
});

// Siparişleri listele (filtreleme ile)
router.get('/orders', adminMiddleware, async (req, res) => {
  try {
    const { status, startDate, endDate, search } = req.query;
    let query = {};

    // Status filtresi
    if (status) {
      query.status = status;
    }

    // Tarih filtresi
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Arama filtresi
    if (search) {
      query.$or = [
        { 'productData.username': { $regex: search, $options: 'i' } },
        { 'productData.link': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate({
        path: 'user',
        select: 'username email',
        options: { retainNullValues: true }
      })
      .populate({
        path: 'product',
        select: 'name price category subCategory',
        options: { retainNullValues: true }
      })
      .sort({ createdAt: -1 });

    // Silinmiş ürün ve kullanıcıları işaretle
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      if (!orderObj.user) {
        orderObj.user = { username: 'Kullanıcı Silinmiş', email: '-' };
      }
      
      if (!orderObj.product) {
        orderObj.product = { 
          name: 'Ürün Silinmiş',
          price: orderObj.totalPrice,
          category: '-',
          subCategory: '-'
        };
      }
      
      return orderObj;
    });

    res.json(processedOrders);
  } catch (error) {
    console.error('Siparişler getirme hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Siparişler yüklenirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Sipariş durumunu güncelle
router.patch('/orders/:id', adminMiddleware, async (req, res) => {
  try {
    const { status, notes, startCount, currentCount } = req.body;
    
    // Önce siparişin var olduğunu kontrol et
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }

    // Siparişi güncelle
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        startCount,
        currentCount,
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('user', 'username email')
    .populate('product');

    res.json(order);
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    res.status(500).json({ 
      message: 'Sipariş güncellenirken bir hata oluştu',
      error: error.message 
    });
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

// Sadece admin KDV oranını güncelleyebilir
router.post('/settings/tax-rate', adminMiddleware, async (req, res) => {
  try {
    const { taxRate } = req.body;
    
    if (taxRate === undefined || taxRate < 0 || taxRate > 1) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir KDV oranı giriniz (0-1 arası)'
      });
    }

    const settings = await Settings.findOne();
    if (settings) {
      settings.taxRate = taxRate;
      settings.updatedAt = Date.now();
      await settings.save();
    } else {
      await Settings.create({ taxRate });
    }

    res.json({
      success: true,
      message: 'KDV oranı güncellendi',
      taxRate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'KDV oranı güncellenirken bir hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 