"use client";
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/navbar/Navbar';
import { motion } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({ taxRate: 0.18 });

  const categories = [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: <FaInstagram className="text-4xl" />, 
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
      icon: <FaTiktok className="text-4xl" />, 
      color: 'from-[#00f2ea] to-[#ff0050]',
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
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Ürünler yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      toast.error('Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'KDV oranı alınamadı');
      }

      const data = await response.json();
      if (!data || typeof data.taxRate !== 'number') {
        throw new Error('Geçersiz KDV oranı');
      }

      setSettings({ taxRate: data.taxRate });
    } catch (error) {
      console.error('KDV oranı alınırken hata:', error);
      if (error.response) {
        console.error('Response:', await error.response.text());
      }
      setSettings({ taxRate: 0.18 }); // Varsayılan değer
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;

    const matchesSubCategory = selectedSubCategory === 'all' || 
      product.subCategory === selectedSubCategory;

    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Modern 3D Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-12 mt-16">
          {/* Subtle Background Pattern */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
          </motion.div>

          {/* Elegant Gradient Orb */}
          <motion.div
            className="absolute rounded-full blur-3xl"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.05, 0.1, 0.05],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
            style={{
              width: '250px',
              height: '250px',
              left: '65%',
              top: '25%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
            }}
          />

          {/* Main Content */}
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-2xl text-white/90">{currentCategory.icon}</span>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {currentCategory.name} Hizmetleri
                </h1>
              </div>
              
              <p className="text-gray-300 text-sm mb-6">
                Profesyonel çözümlerle hesabınızı büyütün
              </p>

              <div className="flex justify-center gap-4">
                {[
                  { value: '24/7', label: 'Destek' },
                  { value: '100%', label: 'Memnuniyet' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -2 }}
                    className="bg-white/5 backdrop-blur rounded-lg px-4 py-2"
                  >
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Minimal Wave Divider */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <svg
              className="relative block w-full h-6"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                className="fill-gray-50"
              ></path>
            </svg>
          </div>
        </div>

        {/* Modern Category Selector */}
        <div className="sticky top-0 z-30">
          {/* Web Görünümü */}
          <div className="hidden sm:block bg-white/80 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-4 py-4">
                {categories.map(category => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedSubCategory('all');
                    }}
                    className={`px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg shadow-${category.color}/25`
                        : 'bg-gray-100/80 hover:bg-gray-200/80'
                    }`}
                  >
                    <motion.span 
                      className="text-2xl"
                      animate={{ rotate: selectedCategory === category.id ? [0, 15, -15, 0] : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {category.icon}
                    </motion.span>
                    <span className="font-semibold tracking-wide">{category.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobil Görünüm */}
          <div className="block sm:hidden bg-white shadow-lg">
            <div className="container mx-auto">
              {/* Ana Kategori Seçici */}
              <div className="relative p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
                      <span className="text-2xl ">{currentCategory.icon}</span>
                    </div>
                    <span className="font-bold text-lg text-gray-800">{currentCategory.name}</span>
                  </div>
                  <div className="relative">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedSubCategory('all');
                      }}
                      className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-white border-2   font-medium focus:ring-2 shadow-md"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Alt Kategori Seçici */}
              <div className="overflow-x-auto scrollbar-hide py-6 px-4 bg-gradient-to-r from-white to-gray-50">
                <div className="flex gap-4 min-w-max">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedSubCategory('all')}
                    className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                      selectedSubCategory === 'all'
                        ? 'bg-gradient-to-br from-primary via-primary-dark to-primary text-white shadow-xl shadow-primary/30 border border-white/20 backdrop-blur-sm'
                        : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-lg border border-gray-100 backdrop-blur-sm'
                    }`}
                  >
                    Tümü
                  </motion.button>
                  {currentCategory.subCategories.map(subCat => (
                    <motion.button
                      key={subCat.id}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedSubCategory(subCat.id)}
                      className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                        selectedSubCategory === subCat.id
                          ? 'bg-gradient-to-br from-primary via-primary-dark to-primary text-white shadow-xl shadow-primary/30 border border-white/20 backdrop-blur-sm'
                          : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-lg border border-gray-100 backdrop-blur-sm'
                      }`}
                    >
                      {subCat.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kategoriler - Web Görünümü */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden sm:block bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md border-t border-white/20"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-4 py-6">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSubCategory('all')}
                className={`px-8 py-3 rounded-2xl transition-all duration-300 font-medium ${
                  selectedSubCategory === 'all'
                    ? 'bg-gradient-to-br from-primary via-primary-dark to-primary text-white shadow-xl shadow-primary/30 border border-white/20'
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-lg border border-gray-100'
                }`}
              >
                Tümü
              </motion.button>
              {currentCategory.subCategories.map(subCat => (
                <motion.button
                  key={subCat.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSubCategory(subCat.id)}
                  className={`px-8 py-3 rounded-2xl transition-all duration-300 font-medium ${
                    selectedSubCategory === subCat.id
                      ? 'bg-gradient-to-br from-primary via-primary-dark to-primary text-white shadow-xl shadow-primary/30 border border-white/20'
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-lg border border-gray-100'
                  }`}
                >
                  {subCat.name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-70"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Aradığınız hizmeti yazın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg focus:shadow-xl focus:border-primary/30 outline-none pl-14 text-lg transition-all duration-300 placeholder:text-gray-400"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2">
                  <svg 
                    className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors duration-300"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-12">
          {filteredProducts.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="group"
                >
                  <div className="h-full transform transition-all duration-300 hover:-translate-y-2">
                    <ProductCard
                      product={{
                        ...product,
                        priceWithTax: product.price * (1 + settings.taxRate)
                      }}
                      showAddToCart={false}
                      className="h-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 max-w-lg w-full mx-auto text-center">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-6xl mb-6"
                >
                  🔍
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Ürün Bulunamadı
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Arama kriterlerinize uygun ürün bulunamadı. Lütfen farklı bir arama yapmayı deneyin.
                </p>
              </div>
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
      </main>
      <Footer />
    </div>
  );
}
