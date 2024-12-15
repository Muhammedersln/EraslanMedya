"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navbar/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import toast from "react-hot-toast";
import { API_URL } from '@/utils/constants';
import ProductCard from "@/components/ProductCard";
import Footer from '@/components/Footer';
import HeroSection from "./components/HeroSection";

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
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const sliderRefs = useRef({});
  const [sliderIntervals, setSliderIntervals] = useState({});

  // Slider'ı başlatma fonksiyonu
  const startSlider = (categoryId) => {
    const interval = setInterval(() => {
      const slider = sliderRefs.current[categoryId];
      if (slider) {
        const scrollAmount = slider.clientWidth;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const currentScroll = slider.scrollLeft;

        // Eğer sona yaklaşıyorsa başa dön ve devam et
        if (currentScroll >= maxScroll - 20) { // 20px tolerans ekledik
          slider.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Bir sonraki karta kaydır
          slider.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }, 3000);

    setSliderIntervals(prev => ({
      ...prev,
      [categoryId]: interval
    }));
  };

  // Slider'ı manuel kaydırma fonksiyonu
  const scrollSlider = (categoryId, direction) => {
    const slider = sliderRefs.current[categoryId];
    if (slider) {
      const scrollAmount = slider.clientWidth;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const currentScroll = slider.scrollLeft;
      let newScroll;

      if (direction === 'left') {
        // Sola kaydırma - başa gelince sona git
        if (currentScroll <= 0) {
          newScroll = maxScroll;
        } else {
          newScroll = Math.max(0, currentScroll - scrollAmount);
        }
      } else {
        // Sağa kaydırma - sona gelince başa git
        if (currentScroll >= maxScroll - 20) { // 20px tolerans
          newScroll = 0;
        } else {
          newScroll = Math.min(maxScroll, currentScroll + scrollAmount);
        }
      }

      slider.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  // Slider'ı durdurma fonksiyonu
  const stopSlider = (categoryId) => {
    if (sliderIntervals[categoryId]) {
      clearInterval(sliderIntervals[categoryId]);
      setSliderIntervals(prev => {
        const newIntervals = { ...prev };
        delete newIntervals[categoryId];
        return newIntervals;
      });
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      Object.values(sliderIntervals).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

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
        fetchCartCount(),
        fetchOrderCount()
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

  const fetchOrderCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Sipariş sayısı alınamadı');
      }
      const data = await response.json();
      setOrderCount(data.count);
    } catch (error) {
      console.error('Sipariş sayısı alınırken hata:', error);
      setOrderCount(0);
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
    <div className="min-h-screen bg-gray-50 flex flex-col mt-16">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <HeroSection 
          user={user} 
          orderCount={orderCount} 
          cartCount={cartCount}
        />

        {/* Category Sections */}
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category.id);
          
          return (
            <section key={category.id} className="mb-8 sm:mb-12">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${category.gradient} text-white`}>
                    {category.icon}
                  </div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{category.name} Hizmetleri</h2>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => scrollSlider(category.id, 'left')}
                    className="p-2.5 rounded-full bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm border border-gray-100 transition-all duration-300 hover:scale-105 group"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollSlider(category.id, 'right')}
                    className="p-2.5 rounded-full bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm border border-gray-100 transition-all duration-300 hover:scale-105 group"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div 
                ref={el => {
                  sliderRefs.current[category.id] = el;
                  if (el && !sliderIntervals[category.id]) {
                    startSlider(category.id);
                  }
                }}
                className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 scroll-smooth"
                onMouseEnter={() => stopSlider(category.id)}
                onMouseLeave={() => startSlider(category.id)}
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  scrollSnapType: 'x mandatory'
                }}
              >
                {loading ? (
                  [...Array(4)].map((_, index) => (
                    <div 
                      key={index}
                      className="w-[calc(100%-32px)] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex-none snap-start"
                    >
                      <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                        <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-3"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-7 sm:h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  categoryProducts.map((product, index) => (
                    <div 
                      key={product._id} 
                      className="w-[calc(100%-32px)] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex-none snap-start"
                      style={{
                        scrollSnapAlign: 'start',
                        scrollSnapStop: 'always'
                      }}
                    >
                      <ProductCard 
                        product={product} 
                        index={index}
                        onCartUpdate={fetchCartCount}
                      />
                    </div>
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
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Giriş Yapmanız Gerekiyor</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">
                  Bu işlemi gerçekleştirmek için lütfen giriş yapın veya hesap oluşturun.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      router.push('/login');
                    }}
                    className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors text-sm sm:text-base"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      router.push('/register');
                    }}
                    className="w-full bg-gray-100 text-gray-800 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base"
                  >
                    Hesap Oluştur
                  </button>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="w-full text-gray-500 py-2.5 hover:text-gray-700 transition-colors text-sm sm:text-base"
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