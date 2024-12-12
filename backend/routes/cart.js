const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

// Sepeti getir
router.get('/', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name description price image minQuantity maxQuantity'
      });

    if (!cart) {
      cart = { items: [] };
    }

    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Sepete ürün ekle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Ürünü kontrol et
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Miktar kontrolü
    if (quantity < product.minQuantity || quantity > product.maxQuantity) {
      return res.status(400).json({ 
        message: `Miktar ${product.minQuantity} ile ${product.maxQuantity} arasında olmalıdır` 
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Yeni sepet oluştur
      cart = new Cart({
        user: req.user._id,
        items: [{ product: productId, quantity }]
      });
    } else {
      // Ürün sepette var mı kontrol et
      const itemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Ürün varsa miktarı güncelle
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Ürün yoksa ekle
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    
    // Güncel sepeti döndür
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name description price image minQuantity maxQuantity'
      });

    res.status(200).json(updatedCart.items);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Sepetteki ürün miktarını güncelle
router.patch('/:itemId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Sepet bulunamadı' });
    }

    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Ürün sepette bulunamadı' });
    }

    // Ürün kontrolü
    const product = await Product.findById(cart.items[itemIndex].product);
    if (quantity < product.minQuantity || quantity > product.maxQuantity) {
      return res.status(400).json({ 
        message: `Miktar ${product.minQuantity} ile ${product.maxQuantity} arasında olmalıdır` 
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name description price image minQuantity maxQuantity'
      });

    res.json(updatedCart.items);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Sepetten ürün sil
router.delete('/:itemId', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Sepet bulunamadı' });
    }

    cart.items = cart.items.filter(item => 
      item._id.toString() !== req.params.itemId
    );

    await cart.save();
    res.json({ message: 'Ürün sepetten kaldırıldı' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Sepet ürün sayısını getir
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.items.length : 0;
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;