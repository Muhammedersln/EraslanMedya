"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/components/DashboardNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram, FaTiktok, FaShoppingCart } from "react-icons/fa";
import { IoTrendingUp } from "react-icons/io5";
import Image from "next/image";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const categories = [
  { 
    id: 'instagram', 
    name: 'Instagram',
    icon: <FaInstagram className="text-2xl" />,
    color: 'from-pink-500 to-purple-500',
    gradient: 'bg-gradient-to-r from-pink-500 to-purple-500'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok',
    icon: <FaTiktok className="text-2xl" />,
    color: 'from-[#00f2ea] to-[#ff0050]',
    gradient: 'bg-gradient-to-r from-[#00f2ea] to-[#ff0050]'
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const sliderRefs = useRef({});

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetchInitialData();
    }
  }, [user, router]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchTrendingProducts(),
        fetchCartCount()
      ]);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    }
  };

  const fetchTrendingProducts = async () => {
    // Simüle edilmiş trending ürünler - backend'de implement edilebilir
    const trending = products.sort(() => 0.5 - Math.random()).slice(0, 5);
    setTrendingProducts(trending);
  };

  const fetchCartCount = async () => {
    // Simüle edilmiş sepet sayısı - backend'de implement edilebilir
    setCartCount(Math.floor(Math.random() * 5));
  };

  const scrollSlider = (categoryId, direction) => {
    const slider = sliderRefs.current[categoryId];
    if (slider) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!user) {
      setSelectedProduct(product);
      setShowAuthModal(true);
      return;
    }

    try {
      // Simüle edilmiş sepete ekleme - backend'de implement edilebilir
      setCartCount(prev => prev + 1);
      toast.success('Ürün sepete eklendi', {
        icon: '🛍️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    }
  };

  if (!user) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath}`;
  };

  const ProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="min-w-[250px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex-shrink-0 snap-start group cursor-pointer overflow-hidden"
      onClick={() => router.push(`/products/${product._id}`)}
    >
      <div className="relative h-32 w-full">
        <Image
          src={getImageUrl(product.image)}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="250px"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">₺{product.price}</span>
          <button 
            onClick={(e) => handleAddToCart(e, product)}
            className="text-sm px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1"
          >
            <FaShoppingCart className="w-3 h-3" />
            <span>Sepete Ekle</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <DashboardNavbar cartCount={cartCount} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 mb-12">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Hoş Geldiniz, {user.firstName}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-lg mb-6"
            >
              Sosyal medya hesaplarınızı büyütmek için en kaliteli hizmetleri sunuyoruz. 
              Hemen alışverişe başlayın ve hesaplarınızı büyütün.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <button 
                onClick={() => router.push('/dashboard/products')}
                className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-primary/25"
              >
                Tüm Ürünleri Gör
              </button>
            </motion.div>
          </div>
        </div>

        {/* Trending Products Section */}
        {trendingProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-orange-500 text-white">
                <IoTrendingUp className="text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Trend Ürünler</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {trendingProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Category Sections with Sliders */}
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category.id);
          
          return (
            <div key={category.id} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${category.gradient} text-white`}>
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{category.name} Hizmetleri</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollSlider(category.id, 'left')}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollSlider(category.id, 'right')}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div 
                ref={el => sliderRefs.current[category.id] = el}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
              >
                {loading ? (
                  [...Array(4)].map((_, index) => (
                    <div 
                      key={index}
                      className="min-w-[250px] bg-white rounded-xl p-4 shadow-sm animate-pulse flex-shrink-0"
                    >
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  categoryProducts.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Giriş Yapmanız Gerekiyor</h3>
                <p className="text-gray-600 mb-6">
                  Bu işlemi gerçekleştirmek için lütfen giriş yapın veya hesap oluşturun.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      router.push('/login');
                    }}
                    className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      router.push('/register');
                    }}
                    className="w-full bg-gray-100 text-gray-800 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Hesap Oluştur
                  </button>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="w-full text-gray-500 py-2.5 hover:text-gray-700 transition-colors"
                  >
                    Vazgeç
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
} 