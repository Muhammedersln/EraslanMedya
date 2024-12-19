"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navbar/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Footer from '@/components/Footer';
import HeroSection from "./components/HeroSection";
import CategorySlider from "./components/CategorySlider";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchInitialData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetchInitialData();
    }
  }, [user, router, fetchInitialData]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/featured');
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
      const response = await fetch('/api/cart/count', {
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
      const response = await fetch('/api/orders/count', {
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
      const response = await fetch('/api/cart', {
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

        <CategorySlider 
          products={products}
          loading={loading}
          onCartUpdate={fetchCartCount}
        />

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