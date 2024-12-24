import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
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
      min: [1, 'Quantity cannot be less than 1']
    },
    price: {
      type: Number,
      required: true
    },
    taxRate: {
      type: Number,
      required: true
    },
    productData: {
      username: String,
      postCount: Number,
      links: [String]
    },
    targetCount: {
      type: Number,
      required: true
    },
    currentCount: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    amount: Number,
    paidAt: Date,
    paymentId: String,
    paymentType: String,
    failReason: String,
    paytrMerchantOid: String,
    paytrToken: String,
    paytrResponse: {
      type: Map,
      of: String
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema); 