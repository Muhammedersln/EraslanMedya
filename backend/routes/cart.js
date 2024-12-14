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
        select: 'name description price image minQuantity maxQuantity category subCategory'
      });

    if (!cart) {
      cart = { items: [] };
    }

    // productData'yı da içeren tam sepet bilgisini döndür
    res.json(cart.items);
  } catch (error) {
    console.error('Sepet getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Sepete ürün ekle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, productData } = req.body;

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

    // ProductData validasyonu
    if (product.subCategory === 'followers') {
      if (!productData?.username?.trim()) {
        return res.status(400).json({ 
          message: 'Takipçi ürünleri için kullanıcı adı zorunludur' 
        });
      }
    } else {
      // Beğeni, izlenme ve yorum için postCount ve links kontrolü
      if (!productData?.postCount || productData.postCount < 1 || productData.postCount > 10) {
        return res.status(400).json({ 
          message: 'Gönderi sayısı 1 ile 10 arasında olmalıdır' 
        });
      }

      if (!productData?.links || !Array.isArray(productData.links) || productData.links.length === 0) {
        return res.status(400).json({ 
          message: `${product.subCategory === 'likes' ? 'Beğeni' : 
                    product.subCategory === 'views' ? 'İzlenme' : 'Yorum'} 
                    ürünleri için en az bir link zorunludur` 
        });
      }

      if (productData.links.some(link => !link || !link.trim())) {
        return res.status(400).json({ 
          message: 'Tüm gönderi linkleri doldurulmalıdır' 
        });
      }
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Yeni sepet oluştur
      cart = new Cart({
        user: req.user._id,
        items: [{
          product: productId,
          quantity,
          productData: product.subCategory === 'followers' 
            ? { username: productData.username.trim() }
            : {
                postCount: productData.postCount,
                links: productData.links.map(link => link.trim())
              }
        }]
      });
    } else {
      // Ürün sepette var mı kontrol et
      const itemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Ürün varsa miktarı ve productData'yı güncelle
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].productData = product.subCategory === 'followers'
          ? { username: productData.username.trim() }
          : {
              postCount: productData.postCount,
              links: productData.links.map(link => link.trim())
            };
      } else {
        // Ürün yoksa ekle
        cart.items.push({
          product: productId,
          quantity,
          productData: product.subCategory === 'followers'
            ? { username: productData.username.trim() }
            : {
                postCount: productData.postCount,
                links: productData.links.map(link => link.trim())
              }
        });
      }
    }

    await cart.save();
    
    // Güncel sepeti döndür
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name description price image minQuantity maxQuantity category subCategory'
      });

    res.json(updatedCart.items);
  } catch (error) {
    console.error('Sepete ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Sepetteki ürün miktarını ve bilgilerini güncelle
router.patch('/:itemId', authMiddleware, async (req, res) => {
  try {
    const { quantity, productData } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Sepet bulunamadı' });
    }

    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Ürünü kontrol et
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Miktar kontrolü
    if (quantity < product.minQuantity || quantity > product.maxQuantity) {
      return res.status(400).json({ 
        message: `Miktar ${product.minQuantity} ile ${product.maxQuantity} arasında olmalıdır` 
      });
    }

    // ProductData validasyonu
    if (productData) {
      if (product.subCategory === 'followers' && !productData?.username?.trim()) {
        return res.status(400).json({ 
          message: 'Takipçi ürünleri için kullanıcı adı zorunludur' 
        });
      }

      if ((product.subCategory === 'likes' || product.subCategory === 'views' || product.subCategory === 'comments')) {
        if (!productData?.links || !Array.isArray(productData.links) || productData.links.length === 0) {
          return res.status(400).json({ 
            message: `${product.subCategory === 'likes' ? 'Beğeni' : 
                      product.subCategory === 'views' ? 'İzlenme' : 'Yorum'} 
                      ürünleri için en az bir link zorunludur` 
          });
        }

        if (productData.links.some(link => !link || !link.trim())) {
          return res.status(400).json({ 
            message: 'Tüm gönderi linkleri doldurulmalıdır' 
          });
        }
      }
    }

    cart.items[itemIndex].quantity = quantity;
    if (productData) {
      cart.items[itemIndex].productData = {
        username: productData?.username?.trim(),
        postCount: productData?.postCount,
        links: productData?.links?.map(link => link.trim())
      };
    }

    await cart.save();

    // Güncel sepeti döndür
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name description price image minQuantity maxQuantity category subCategory'
      });

    res.json(updatedCart.items);
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Sepetten ürün kaldır
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