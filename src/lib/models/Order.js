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
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    taxRate: {
      type: Number,
      default: 0.18
    },
    productData: {
      username: String,
      link: String,
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
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'expired'],
    default: 'pending'
  },
  paymentDetails: {
    status: String,
    amount: Number,
    paidAt: Date,
    paymentType: String,
    paytrMerchantOid: String,
    paytrToken: String,
    paytrResponse: Map
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Normal indeks ekle (TTL olmayan)
orderSchema.index({ expiresAt: 1 });

// Güncelleme zamanını otomatik ayarla
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Model oluşturulduğunda mevcut TTL indeksini sil
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

if (mongoose.connection.readyState === 1) { // Eğer veritabanına bağlıysak
  Order.collection.dropIndex('expiresAt_1')
    .then(() => console.log('TTL indeksi başarıyla silindi'))
    .catch(err => {
      if (err.code !== 27) { // 27: indeks bulunamadı hatası
        console.error('TTL indeksi silinirken hata:', err);
      }
    });
}

export default Order; 