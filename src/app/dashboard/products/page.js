"use client";
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import DashboardNavbar from '@/components/Navbar';
import { API_URL } from '@/utils/constants';
import { motion } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Footer from '@/components/Footer';

export default function DashboardProducts() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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

  // Auth kontrolü
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    // Kategori filtreleme
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;

    // Alt kategori filtreleme - düzeltilmiş hali
    const matchesSubCategory = selectedSubCategory === 'all' || 
      product.subCategory === selectedSubCategory;

    // Arama filtreleme
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Debug için kontrol
    console.log('Filtering Product:', {
      product,
      selectedCategory,
      selectedSubCategory,
      matchesCategory,
      matchesSubCategory,
      matchesSearch
    });

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  const currentCategory = categories.find(cat => cat.id === selectedCategory) || categories[0];

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!user) {
      setSelectedProduct(product);
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1
        })
      });

      if (!response.ok) throw new Error('Ürün sepete eklenemedi');

      toast.success('Ürün sepete eklendi', {
        icon: '🛍️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // Sepet sayısını güncelle
      const cartResponse = await fetch(`${API_URL}/api/cart/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (cartResponse.ok) {
        const { count } = await cartResponse.json();
        setCartCount(count);
      }
    } catch (error) {
      console.error('Sepete eklenirken hata:', error);
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <DashboardNavbar />
      <main className="flex-grow">
        {/* Modern 3D Hero Section */}
        <div className={`relative overflow-hidden bg-gradient-to-r ${currentCategory.color} py-16`}>
          {/* Animated Background Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {/* Animated Grid Pattern */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '30px 30px',
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-primary/20" />

            {/* Simplified Floating Elements - Only 3 instead of 6 */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * 200,
                  scale: 0.5,
                  opacity: 0.3
                }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 360],
                  scale: [0.5, 0.7, 0.5],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `rgba(37, 99, 235, ${0.1 + i * 0.05})`,
                  filter: 'blur(20px)'
                }}
              />
            ))}
          </motion.div>

          {/* Main Content - More Compact */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                {/* Left Side - Icon and Title */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="filter drop-shadow-xl"
                  >
                    <span className="text-white">
                      {currentCategory.icon}
                    </span>
                  </motion.div>
                  <div className="text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                      {currentCategory.name}{" "}
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Hizmetleri
                      </span>
                    </h1>
                    <p className="text-white/90 text-sm md:text-base mt-1">
                      Profesyonel çözümlerle hesabınızı büyütün
                    </p>
                  </div>
                </motion.div>

                {/* Right Side - Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex gap-4"
                >
                  {[
                    { value: '24/7', label: 'Destek' },
                    { value: '100%', label: 'Memnuniyet' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center px-4 py-2 rounded-xl bg-primary-dark/20 backdrop-blur-lg hover:bg-primary-dark/30 transition-colors"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-white/80">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg
              className="relative block w-full h-8"
              xmlns="http://www.w3.org/2000/svg"
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
          <div className="hidden md:block bg-white/80 backdrop-blur-lg shadow-sm">
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
          <div className="md:hidden bg-white shadow-sm">
            <div className="container mx-auto px-4">
              {/* Mobil Kategori Seçici */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentCategory.icon}</span>
                  <span className="font-semibold text-lg">{currentCategory.name}</span>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubCategory('all');
                  }}
                  className="appearance-none bg-gray-100 px-4 py-2 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobil Alt Kategori Seçici */}
              <div className="border-b">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex whitespace-nowrap p-3 gap-2">
                    <button
                      onClick={() => setSelectedSubCategory('all')}
                      className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSubCategory === 'all'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Tümü
                    </button>
                    {currentCategory.subCategories.map(subCat => (
                      <button
                        key={subCat.id}
                        onClick={() => setSelectedSubCategory(subCat.id)}
                        className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedSubCategory === subCat.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {subCat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kategoriler - Web Görünümü */}
        <div className="hidden md:block bg-white/50 backdrop-blur-sm border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-4 py-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSubCategory('all')}
                className={`px-6 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                  selectedSubCategory === 'all'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100/80 hover:bg-gray-200/80'
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
                  className={`px-6 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                    selectedSubCategory === subCat.id
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-gray-100/80 hover:bg-gray-200/80'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  showAddToCart={true}
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm p-8 max-w-md mx-auto"
              >
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ürün Bulunamadı</h3>
                <p className="text-gray-600">
                  Arama kriterlerinize uygun ürün bulunamadı. Lütfen farklı bir arama yapmayı deneyin.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 