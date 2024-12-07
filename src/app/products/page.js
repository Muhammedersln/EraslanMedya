"use client";
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { API_URL } from '@/utils/constants';
import { motion } from 'framer-motion';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: '📸', 
      color: 'from-pink-500 to-purple-500',
      subCategories: [
        { id: 'followers', name: 'Takipçi' },
        { id: 'likes', name: 'Beğeni' },
        { id: 'views', name: 'İzlenme' },
        { id: 'comments', name: 'Yorum' }
      ]
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: '🎵', 
      color: 'from-blue-500 to-cyan-500',
      subCategories: [
        { id: 'followers', name: 'Takipçi' },
        { id: 'likes', name: 'Beğeni' },
        { id: 'views', name: 'İzlenme' },
        { id: 'comments', name: 'Yorum' }
      ]
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSubCategory = selectedSubCategory === 'all' || product.subCategory === selectedSubCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  const currentCategory = categories.find(cat => cat.id === selectedCategory) || categories[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${currentCategory.color} py-16 mt-16`}>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-6xl mb-4 inline-block">{currentCategory.icon}</span>
            <h1 className="text-4xl font-bold text-white mb-4">
              {currentCategory.name} Hizmetleri
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Hesabınızı büyütmek için ihtiyacınız olan tüm hizmetler
            </p>
          </motion.div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Main Categories */}
      <div className="sticky top-0 bg-white shadow-md z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-4 py-4">
            {categories.map(category => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedSubCategory('all');
                }}
                className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub Categories */}
      <div className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-4 py-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSubCategory('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedSubCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Tümü
            </motion.button>
            {currentCategory.subCategories.map(subCat => (
              <motion.button
                key={subCat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSubCategory(subCat.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSubCategory === subCat.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {subCat.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Hizmet ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none pl-12"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Hizmet Bulunamadı
            </h3>
            <p className="text-gray-600">
              Arama kriterlerinize uygun hizmet bulunamadı. 
              Farklı bir kategori seçmeyi veya arama terimini değiştirmeyi deneyebilirsiniz.
            </p>
          </motion.div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡️', title: 'Hızlı Teslimat', desc: 'Siparişleriniz anında işleme alınır' },
              { icon: '🔒', title: 'Güvenli Ödeme', desc: 'SSL korumalı ödeme sistemi' },
              { icon: '💬', title: '7/24 Destek', desc: 'Sorularınız için her zaman yanınızdayız' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 