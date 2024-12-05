const router = require('express').Router();
const Product = require('../models/Product');

// Tüm aktif ürünleri getir
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 