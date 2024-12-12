"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/components/DashboardNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram, FaTiktok, FaShoppingCart } from "react-icons/fa";
import { IoTrendingUp } from "react-icons/io5";
import toast from "react-hot-toast";
import { API_URL } from '@/utils/constants';
import DashboardProductCard from "@/components/DashboardProductCard";
import Footer from '@/components/Footer';

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
      await fetchProducts();
      await Promise.all([
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
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Ürünler yüklenemedi');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      toast.error('Ürünler yüklenirken bir hata oluştu');
    }
  };

  const fetchTrendingProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/trending`);
      if (!response.ok) {
        const trending = products.sort(() => 0.5 - Math.random()).slice(0, 5);
        setTrendingProducts(trending);
        return;
      }
      const data = await response.json();
      setTrendingProducts(data);
    } catch (error) {
      console.error('Trend ürünler yüklenirken hata:', error);
      const trending = products.sort(() => 0.5 - Math.random()).slice(0, 5);
      setTrendingProducts(trending);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Sepet sayısı alınamadı');
      }
      const data = await response.json();
      setCartCount(data.count);
    } catch (error) {
      console.error('Sepet sayısı alınırken hata:', error);
      setCartCount(0);
    }
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
      router.push('/login');
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
          quantity: product.minQuantity
        })
      });

      if (!response.ok) {
        throw new Error('Ürün sepete eklenemedi');
      }

      toast.success('Ürün sepete eklendi');
      fetchCartCount();
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 lg:p-12 mb-12">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
            >
              Hoş Geldiniz, {user.firstName}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-base lg:text-lg mb-6"
            >
              Sosyal medya hesaplarınızı büyütmek için en kaliteli hizmetleri sunuyoruz. 
              Hemen alışverişe başlayın ve hesaplarınızı büyütün.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button 
                onClick={() => router.push('/dashboard/products')}
                className="bg-primary text-white px-6 lg:px-8 py-3 rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-primary/25 text-sm lg:text-base"
              >
                Tüm Ürünleri Gör
              </button>
            </motion.div>
          </div>
        </div>

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-orange-500 text-white">
                <IoTrendingUp className="text-xl lg:text-2xl" />
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">Trend Ürünler</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
              {trendingProducts.map((product, index) => (
                <DashboardProductCard 
                  key={product._id} 
                  product={product} 
                  index={index}
                  onCartUpdate={fetchCartCount}
                />
              ))}
            </div>
          </section>
        )}

        {/* Category Sections */}
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category.id);
          
          return (
            <section key={category.id} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${category.gradient} text-white`}>
                    {category.icon}
                  </div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">{category.name} Hizmetleri</h2>
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
                className="flex gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
              >
                {loading ? (
                  [...Array(4)].map((_, index) => (
                    <div 
                      key={index}
                      className="min-w-[250px] lg:min-w-[280px] bg-white rounded-xl p-4 shadow-sm animate-pulse flex-shrink-0"
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
                    <DashboardProductCard 
                      key={product._id} 
                      product={product} 
                      index={index}
                      onCartUpdate={fetchCartCount}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}

        {/* Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
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

      <Footer />
    </div>
  );
}