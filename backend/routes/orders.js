const router = require('express').Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/authMiddleware');
const Product = require('../models/Product');

// Sipariş oluştur
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Geçerli sipariş verileri bulunamadı' 
      });
    }

    const orders = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: `Ürün bulunamadı: ${item.product}` 
        });
      }

      // Miktar kontrolü
      if (item.quantity < product.minQuantity || item.quantity > product.maxQuantity) {
        return res.status(400).json({
          success: false,
          message: `Miktar ${product.minQuantity} ile ${product.maxQuantity} arasında olmalıdır`
        });
      }

      // Sipariş oluştur
      const order = new Order({
        user: req.user._id,
        product: product._id,
        quantity: item.quantity,
        totalPrice: product.price * item.quantity,
        productData: item.productData,
        targetCount: item.quantity,
        startCount: 0,
        currentCount: 0,
        status: 'pending'
      });

      await order.save();
      orders.push(order);
    }

    // Sepeti temizle
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
      message: 'Siparişler başarıyla oluşturuldu',
      orders
    });
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcının siparişlerini getir
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Siparişleri getirme hatası:', error);
    res.status(500).json({ message: 'Siparişler getirilirken bir hata oluştu' });
  }
});

// Sipariş detayını getir
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('product');

    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }

    res.json(order);
  } catch (error) {
    console.error('Sipariş detayı getirme hatası:', error);
    res.status(500).json({ message: 'Sipariş detayı getirilirken bir hata oluştu' });
  }
});

module.exports = router; 