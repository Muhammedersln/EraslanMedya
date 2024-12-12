"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import DashboardNavbar from '@/components/DashboardNavbar';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
      setQuantity(data.minQuantity || 1);
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    toast.success('Ürün sepete eklendi', {
      icon: '🛍️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ürün bulunamadı</h2>
          <p className="text-gray-600 mt-2">Bu ürün artık mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            Ürünlere Dön
          </button>
        </div>
      </div>
    );
  }

  const tabContent = {
    description: (
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600">{product.description}</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-medium text-gray-900">Minimum Sipariş</h4>
            <p className="text-2xl font-bold text-primary mt-1">{product.minQuantity}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-medium text-gray-900">Maksimum Sipariş</h4>
            <p className="text-2xl font-bold text-primary mt-1">{product.maxQuantity}</p>
          </div>
        </div>
      </div>
    ),
    details: (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-medium text-gray-900 mb-2">Ürün Özellikleri</h4>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-full"></span>
              Hızlı Teslimat
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-full"></span>
              7/24 Destek
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-full"></span>
              Güvenli Ödeme
            </li>
          </ul>
        </div>
      </div>
    ),
    reviews: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Müşteri Değerlendirmeleri</h4>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-600 ml-2">5.0 (125 değerlendirme)</span>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? <DashboardNavbar /> : <Navbar />}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button onClick={() => router.push('/products')} className="text-gray-500 hover:text-primary">
                Ürünler
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-400">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Ürün Görseli */}
            <div className="md:w-1/2">
              <div className="relative h-[500px] w-full group">
                <Image
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute top-4 right-4">
                  <motion.span 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      product.category === 'instagram' 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    }`}
                  >
                    {product.category === 'instagram' ? 'Instagram' : 'TikTok'}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Ürün Detayları */}
            <div className="md:w-1/2 p-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                {product.name}
              </motion.h1>

              {/* Tabs */}
              <div className="mb-8">
                <div className="flex space-x-4 border-b">
                  {['description', 'details', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                        selectedTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {selectedTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tabContent[selectedTab]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Fiyat ve Sipariş */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-xl font-medium"
                    >
                      -
                    </motion.button>
                    <span className="text-2xl font-medium w-16 text-center">{quantity}</span>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                      className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-xl font-medium"
                    >
                      +
                    </motion.button>
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    ₺{product.price}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:from-primary-dark hover:to-primary"
                >
                  <span>Sepete Ekle</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Giriş Yapın
                </h3>
                <p className="text-gray-600">
                  Ürünleri satın almak için lütfen giriş yapın veya yeni bir hesap oluşturun.
                </p>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/login');
                  }}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Giriş Yap</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/register');
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Kayıt Ol</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 