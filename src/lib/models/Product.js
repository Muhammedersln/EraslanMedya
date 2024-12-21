import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image URL is required']
  },
  imagePublicId: {
    type: String,
    required: [true, 'Product image public ID is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['instagram', 'tiktok']
  },
  subCategory: {
    type: String,
    required: [true, 'Product subcategory is required'],
    enum: ['followers', 'likes', 'views', 'comments']
  },
  minQuantity: {
    type: Number,
    required: [true, 'Minimum quantity is required'],
    min: [1, 'Minimum quantity must be at least 1']
  },
  maxQuantity: {
    type: Number,
    required: [true, 'Maximum quantity is required'],
    validate: {
      validator: function(value) {
        return value > this.minQuantity;
      },
      message: 'Maximum quantity must be greater than minimum quantity'
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Eğer model zaten tanımlıysa onu kullan, değilse yeni model oluştur
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 