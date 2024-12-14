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
      postCount: {
        type: Number,
        min: 1,
        required: function() {
          return this.product && this.product.subCategory !== 'followers';
        }
      },
      links: {
        type: [String],
        required: function() {
          return this.product && this.product.subCategory !== 'followers';
        },
        validate: {
          validator: function(links) {
            return links && links.length > 0 && links.every(link => link && link.trim().length > 0);
          },
          message: 'Tüm gönderi linkleri doldurulmalıdır'
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

// Validation
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

      // Takipçi harici hizmetler için link kontrolü
      if (product.subCategory !== 'followers') {
        if (!item.productData.postCount || item.productData.postCount < 1) {
          throw new Error('Gönderi sayısı en az 1 olmalıdır');
        }

        if (!item.productData.links || !Array.isArray(item.productData.links) || item.productData.links.length === 0) {
          throw new Error('En az bir gönderi linki girilmelidir');
        }

        if (item.productData.links.some(link => !link || !link.trim())) {
          throw new Error('Tüm gönderi linkleri doldurulmalıdır');
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Cart', cartSchema);