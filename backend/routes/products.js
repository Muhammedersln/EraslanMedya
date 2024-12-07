const router = require('express').Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Tüm aktif ürünleri getir
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tekil ürün getirme endpoint'i
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    if (!product.active) {
      return res.status(404).json({ message: 'Bu ürün artık mevcut değil' });
    }

    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Geçersiz ürün ID' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ürün ekleme endpoint'i
router.post('/products', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // Admin kontrolü ekle
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Form verilerini al
    const productData = {
      ...req.body,
      image: req.file ? req.file.filename : null
    };

    // Detaylı validasyon kontrolleri
    const requiredFields = {
      name: 'Ürün adı',
      price: 'Fiyat',
      category: 'Kategori',
      subCategory: 'Alt kategori',
      minQuantity: 'Minimum miktar',
      maxQuantity: 'Maksimum miktar'
    };

    const errors = [];

    // Zorunlu alanları kontrol et
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!productData[field]) {
        errors.push({
          field,
          message: `${label} alanı zorunludur`
        });
      }
    });

    // Sayısal değerleri kontrol et
    if (productData.price && Number(productData.price) <= 0) {
      errors.push({
        field: 'price',
        message: 'Fiyat 0\'dan büyük olmalıdır'
      });
    }

    if (productData.minQuantity && Number(productData.minQuantity) < 1) {
      errors.push({
        field: 'minQuantity',
        message: 'Minimum miktar 1\'den küçük olamaz'
      });
    }

    if (productData.maxQuantity && Number(productData.maxQuantity) <= Number(productData.minQuantity)) {
      errors.push({
        field: 'maxQuantity',
        message: 'Maksimum miktar minimum miktardan büyük olmalıdır'
      });
    }

    // Hata varsa geri dön
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validasyon hatası',
        errors
      });
    }

    // Ürünü kaydet
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json(product);
    
  } catch (error) {
    res.status(400).json({
      message: error.message || 'Ürün eklenirken bir hata oluştu'
    });
  }
});

module.exports = router; 