const mongoose = require('mongoose');
const Settings = require('./Settings');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz']
  },
  category: {
    type: String,
    required: [true, 'Kategori zorunludur'],
    enum: {
      values: ['instagram', 'tiktok'],
      message: 'Geçersiz kategori'
    }
  },
  subCategory: {
    type: String,
    required: [true, 'Alt kategori zorunludur'],
    enum: {
      values: ['followers', 'likes', 'views', 'comments'],
      message: 'Geçersiz alt kategori'
    }
  },
  image: {
    type: String
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
        const minQuantity = this.get('minQuantity');
        return value > minQuantity;
      },
      message: 'Maksimum miktar minimum miktardan büyük olmalıdır'
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// KDV'li fiyat hesaplama methodu
productSchema.methods.getPriceWithTax = async function() {
  const settings = await Settings.getSettings();
  return this.price * (1 + settings.taxRate);
};

// Ürünleri toplu olarak KDV'li fiyatlarıyla getirme
productSchema.statics.getProductsWithTax = async function() {
  const products = await this.find();
  const settings = await Settings.getSettings();
  
  return products.map(product => {
    const productObj = product.toObject();
    productObj.priceWithTax = product.price * (1 + settings.taxRate);
    return productObj;
  });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;