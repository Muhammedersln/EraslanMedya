const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    productData: {
      username: {
        type: String,
        required: function() {
          return this.product && this.product.subCategory === 'followers';
        }
      },
      link: {
        type: String,
        required: function() {
          return this.product && (this.product.subCategory === 'likes' || 
                                this.product.subCategory === 'views' || 
                                this.product.subCategory === 'comments');
        }
      }
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Güncelleme zamanını otomatik güncelle
cartSchema.pre('save', async function(next) {
  try {
    for (const item of this.items) {
      const product = await mongoose.model('Product').findById(item.product);
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      if (item.quantity < product.minQuantity || item.quantity > product.maxQuantity) {
        throw new Error(`Miktar ${product.minQuantity} ile ${product.maxQuantity} arasında olmalıdır`);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Cart', cartSchema);