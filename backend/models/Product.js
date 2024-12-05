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
    enum: ['instagram', 'tiktok', 'youtube']
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
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Product', productSchema); 