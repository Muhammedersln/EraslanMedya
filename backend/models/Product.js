const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['instagram', 'tiktok']
  },
  subCategory: {
    type: String,
    required: true,
    enum: ['followers', 'likes', 'views', 'comments']
  },
  minQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  maxQuantity: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 