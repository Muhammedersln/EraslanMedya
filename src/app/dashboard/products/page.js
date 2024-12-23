"use client";
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import ListCard from '@/components/ListCard';
import Navbar from '@/components/navbar/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('popular');
  const [isMobile, setIsMobile] = useState(false);
  const [defaultCategories] = useState(['instagram', 'tiktok']);
  const [defaultSubCategory] = useState('followers');

  const categories = [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: <FaInstagram className="text-2xl" />, 
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
      icon: <FaTiktok className="text-2xl" />, 
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
    
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

    const matchesPriceRange = 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1];

    return matchesCategory && matchesSubCategory && matchesSearch && matchesPriceRange;
  }).sort((a, b) => {
    if (a.subCategory === 'followers' && b.subCategory !== 'followers') return -1;
    if (a.subCategory !== 'followers' && b.subCategory === 'followers') return 1;

    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

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
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Mobile Filter Button - Fixed Position */}
        <div className="lg:hidden fixed right-4 bottom-24 z-50">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>

        {/* Mobile Filter Modal */}
        {isMobile && isFilterOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end lg:hidden">
            <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between z-10">
                <h2 className="text-xl font-bold">Filtreler</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-8">
                  {/* Search */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Ara
                    </h3>
                    <div className="relative">
                    <input
                      type="text"
                      placeholder="Hizmet ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Kategoriler
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCategory('all');
                          setSelectedSubCategory('all');
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 border-2 ${
                          selectedCategory === 'all'
                            ? 'bg-gradient-to-r from-primary to-primary-dark text-white border-transparent'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          </div>
                          <span className="font-medium">Tümü</span>
                        </div>
                      </motion.button>

                      {categories.map(category => (
                        <div key={category.id} className="space-y-2">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setSelectedSubCategory('all');
                            }}
                            className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 border-2 ${
                              selectedCategory === category.id
                                ? `bg-gradient-to-r ${category.color} text-white border-transparent`
                                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                                  {category.icon}
                                </div>
                                <span className="font-medium">{category.name}</span>
                              </div>
                              <svg
                                className={`w-5 h-5 transform transition-transform duration-200 ${
                                  selectedCategory === category.id ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </motion.button>

                          <AnimatePresence>
                            {selectedCategory === category.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-4 space-y-2 overflow-hidden"
                              >
                                {category.subCategories.map(subCat => (
                                  <motion.button
                                    key={subCat.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedSubCategory(subCat.id)}
                                    className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                      selectedSubCategory === subCat.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        selectedSubCategory === subCat.id ? 'bg-primary' : 'bg-gray-400'
                                      }`} />
                                      {subCat.name}
                                    </div>
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Fiyat Aralığı
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-sm text-gray-500 mb-1 block">Min Fiyat</label>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm text-gray-500 mb-1 block">Max Fiyat</label>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="px-2">
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Sıralama
                    </h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="popular">Popülerlik</option>
                      <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                      <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                      <option value="newest">En Yeni</option>
                      <option value="oldest">En Eski</option>
                      <option value="name-asc">İsim: A-Z</option>
                      <option value="name-desc">İsim: Z-A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sticky Footer with Actions */}
              <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory('all');
                    setSearchQuery('');
                    setPriceRange([0, 5000]);
                    setSortBy('popular');
                  }}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Filtreleri Temizle
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors"
                >
                  Filtreleri Uygula ({filteredProducts.length} Sonuç)
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Search */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Ara
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Hizmet ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Kategoriler
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubCategory('all');
                    }}
                    className={`w-full px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      selectedCategory === 'all'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>Tümü</span>
                    </div>
                  </motion.button>

                  {categories.map(category => (
                    <div key={category.id} className="space-y-1">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedSubCategory('all');
                        }}
                        className={`w-full px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {category.icon}
                            <span>{category.name}</span>
                          </div>
                          <svg
                            className={`w-4 h-4 transform transition-transform duration-200 ${
                              selectedCategory === category.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {selectedCategory === category.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-6 space-y-1"
                          >
                            {category.subCategories.map(subCat => (
                              <motion.button
                                key={subCat.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setSelectedSubCategory(subCat.id)}
                                className={`w-full px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                                  selectedSubCategory === subCat.id
                                    ? 'bg-primary/5 text-primary font-medium'
                                    : 'hover:bg-gray-50/80 text-gray-500'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-1 h-1 rounded-full ${
                                    selectedSubCategory === subCat.id ? 'bg-primary' : 'bg-gray-400'
                                  }`} />
                                  {subCat.name}
                                </div>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fiyat Aralığı
                </h3>
                <div className="px-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500 mb-1 block">Min Fiyat</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-500 mb-1 block">Max Fiyat</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sıralama
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="popular">Popülerlik</option>
                  <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="name-asc">İsim: A-Z</option>
                  <option value="name-desc">İsim: Z-A</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubCategory('all');
                  setSearchQuery('');
                  setPriceRange([0, 5000]);
                  setSortBy('popular');
                }}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Filtreleri Temizle
              </button>
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-grow">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {filteredProducts.length} Sonuç Bulundu
                </h2>
                {/* View Mode Toggle - Hide on Mobile */}
                <div className="hidden lg:flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Display */}
            {filteredProducts.length > 0 ? (
              <AnimatePresence mode="wait">
                {(!isMobile && viewMode === 'list') ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {filteredProducts.map((product) => (
                      <ListCard
                        key={product._id}
                        product={{
                          ...product,
                          priceWithTax: product.price * (1 + settings.taxRate)
                        }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={{
                          ...product,
                          priceWithTax: product.price * (1 + settings.taxRate)
                        }}
                        showAddToCart={false}
                        className="h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-8 text-center"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Sonuç Bulunamadı
                </h3>
                <p className="text-gray-600">
                  Arama kriterlerinize uygun ürün bulunamadı. Lütfen farklı filtreler deneyiniz.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
