import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1']
  },
  productData: {
    username: String,
    postCount: Number,
    links: [String]
  }
}, {
  timestamps: true
});

// Ensure unique product per user
cartSchema.index({ user: 1, product: 1 }, { unique: true });

// Validate quantity against product min/max
cartSchema.pre('save', async function(next) {
  try {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    
    if (!product) {
      throw new Error('Product not found');
    }

    if (this.quantity < product.minQuantity) {
      throw new Error(`Minimum quantity is ${product.minQuantity}`);
    }

    if (this.quantity > product.maxQuantity) {
      throw new Error(`Maximum quantity is ${product.maxQuantity}`);
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema); 