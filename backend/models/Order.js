const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Sipariş oluşturulmadan önce toplam fiyatı hesapla
orderSchema.pre('save', async function(next) {
  if (this.isModified('quantity') || this.isNew) {
    const product = await mongoose.model('Product').findById(this.product);
    if (product) {
      this.totalPrice = product.price * this.quantity;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema); 