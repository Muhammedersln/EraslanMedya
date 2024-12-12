const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı zorunludur']
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması zorunludur']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: [0, 'Fiyat 0\'dan büyük olmalıdır']
  },
  category: {
    type: String,
    required: [true, 'Kategori zorunludur'],
    enum: {
      values: ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter'],
      message: 'Geçersiz kategori'
    }
  },
  subCategory: {
    type: String,
    required: [true, 'Alt kategori zorunludur'],
    enum: {
      values: ['followers', 'likes', 'views', 'comments', 'shares', 'subscribers'],
      message: 'Geçersiz alt kategori'
    }
  },
  minQuantity: {
    type: Number,
    required: [true, 'Minimum miktar zorunludur'],
    min: [1, 'Minimum miktar 1\'den küçük olamaz']
  },
  maxQuantity: {
    type: Number,
    required: [true, 'Maksimum miktar zorunludur'],
    validate: {
      validator: function(value) {
        return value > this.minQuantity;
      },
      message: 'Maksimum miktar minimum miktardan büyük olmalıdır'
    }
  },
  image: {
    type: String,
    required: [true, 'Ürün görseli zorunludur']
  },
  taxRate: {
    type: Number,
    required: [true, 'KDV oranı zorunludur'],
    default: 12,
    min: [0, 'KDV oranı 0\'dan küçük olamaz'],
    max: [100, 'KDV oranı 100\'den büyük olamaz']
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 