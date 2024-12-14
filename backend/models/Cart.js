const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
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
      trim: true
    },
    postCount: {
      type: Number,
      min: 1,
      max: 10
    },
    links: {
      type: [String]
    }
  }
});

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Pre-save middleware for validation
cartSchema.pre('save', async function(next) {
  try {
    for (const item of this.items) {
      const product = await mongoose.model('Product').findById(item.product);
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      // Takipçi ürünleri için sadece username kontrolü
      if (product.subCategory === 'followers') {
        if (!item.productData.username || !item.productData.username.trim()) {
          throw new Error('Takipçi ürünleri için kullanıcı adı zorunludur');
        }
      } else {
        // Diğer ürünler için postCount ve links kontrolü
        if (!item.productData.postCount || item.productData.postCount < 1 || item.productData.postCount > 10) {
          throw new Error('Gönderi sayısı 1 ile 10 arasında olmalıdır');
        }

        if (!item.productData.links || !Array.isArray(item.productData.links) || 
            item.productData.links.length === 0 || 
            item.productData.links.some(link => !link || !link.trim())) {
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