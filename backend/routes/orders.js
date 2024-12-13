const router = require('express').Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/authMiddleware');

// Sipariş oluştur
router.post('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Sepetiniz boş' });
    }

    // Siparişleri oluştur
    const orders = await Promise.all(cart.items.map(async (item) => {
      const order = new Order({
        user: req.user._id,
        product: item.product._id,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
        productData: item.productData,
        status: 'pending'
      });
      return order.save();
    }));

    // Sepeti temizle
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } });

    res.status(201).json(orders);
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    res.status(500).json({ message: 'Sipariş oluşturulurken bir hata oluştu' });
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

// Ödeme işlemi
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Sepetiniz boş' });
    }

    // Toplam tutarı hesapla
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Burada gerçek ödeme entegrasyonu yapılabilir (iyzico, stripe vb.)
    
    // Başarılı ödeme sonrası siparişleri oluştur
    const orders = await Promise.all(cart.items.map(async (item) => {
      const order = new Order({
        user: req.user._id,
        product: item.product._id,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
        productData: item.productData,
        status: 'pending'
      });
      return order.save();
    }));

    // Sepeti temizle
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } });

    res.status(201).json({
      success: true,
      message: 'Ödeme başarılı, siparişleriniz oluşturuldu',
      orders
    });
  } catch (error) {
    console.error('Ödeme hatası:', error);
    res.status(500).json({ message: 'Ödeme işlemi sırasında bir hata oluştu' });
  }
});

module.exports = router; 