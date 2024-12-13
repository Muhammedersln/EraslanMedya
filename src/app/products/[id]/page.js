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
import Footer from '@/components/Footer';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  const [productData, setProductData] = useState({
    username: '',
    link: ''
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setQuantity(product.minQuantity || 1);
      setProductData({ username: '', link: '' });
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Ürün bulunamadı');
      }
      
      const data = await response.json();
      setProduct(data);
      setQuantity(data.minQuantity || 1);
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
      toast.error('Ürün yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (quantity < product.minQuantity || quantity > product.maxQuantity) {
      toast.error(`Miktar ${product.minQuantity} ile ${product.maxQuantity} arasında olmalıdır`);
      return;
    }

    if (product.subCategory === 'followers' && !productData.username?.trim()) {
      toast.error('Lütfen kullanıcı adını girin');
      return;
    }

    if ((product.subCategory === 'likes' || product.subCategory === 'views' || product.subCategory === 'comments') && !productData.link?.trim()) {
      toast.error('Lütfen linki girin');
      return;
    }

    try {
      setAddingToCart(true);
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
          productData: {
            username: productData.username?.trim(),
            link: productData.link?.trim()
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ürün sepete eklenemedi');
      }

      toast.success('Ürün sepete eklendi');
      setProductData({ username: '', link: '' });
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast.error(error.message || 'Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setAddingToCart(false);
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {user ? <DashboardNavbar /> : <Navbar />}
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-2">
              <li>
                <button onClick={() => router.push('/products')} className="text-gray-400 hover:text-primary text-sm">
                  Ürünler
                </button>
              </li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-400 text-sm">{product.name}</li>
            </ol>
          </nav>

          <div className="bg-white rounded-xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ürün Görseli */}
              <div className="lg:col-span-1">
                <div className="relative h-[250px] w-full rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700`}
                  >
                    {product.category === 'instagram' ? 'Instagram' : 'TikTok'}
                  </motion.span>
                </div>
              </div>

              {/* Ürün Detayları */}
              <div className="lg:col-span-2">
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-medium text-gray-900 mb-4"
                >
                  {product.name}
                </motion.h1>

                {/* Fiyat ve Miktar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-50 text-gray-500"
                    >
                      -
                    </button>
                    <span className="text-lg w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-50 text-gray-500"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-2xl font-medium text-primary">
                    ₺{product.price}
                  </div>
                </div>

                {/* Product Data Fields */}
                <div className="space-y-4 mb-6">
                  {product.subCategory === 'followers' ? (
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        {product.category === 'instagram' ? 'Instagram' : 'TikTok'} Kullanıcı Adı
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={productData.username}
                        onChange={(e) => setProductData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="@kullaniciadi"
                        disabled={addingToCart}
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                        {product.category === 'instagram' ? 'Gönderi Linki' : 'Video Linki'}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="link"
                        value={productData.link}
                        onChange={(e) => setProductData(prev => ({ ...prev, link: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={product.category === 'instagram' ? 'https://instagram.com/...' : 'https://tiktok.com/...'}
                        disabled={addingToCart}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors mb-8 flex items-center justify-center gap-2 ${
                    addingToCart ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Ekleniyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Sepete Ekle</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Bilgi Sekmeleri */}
                <div className="space-y-4">
                  {['description', 'details', 'reviews'].map((tab) => (
                    <div key={tab} className="border-t border-gray-100 pt-4">
                      <button
                        onClick={() => setSelectedTab(tab)}
                        className="w-full flex items-center justify-between py-2"
                      >
                        <span className={`text-sm ${selectedTab === tab ? 'text-gray-900' : 'text-gray-500'}`}>
                          {tab === 'description' ? 'Açıklama' : 
                           tab === 'details' ? 'Detaylar' : 'Değerlendirmeler'}
                        </span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${selectedTab === tab ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {selectedTab === tab && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-4"
                        >
                          {tabContent[tab]}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Giriş Yapın
                </h3>
                <p className="text-gray-600 mb-6">
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

                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm mt-4"
                >
                  Vazgeç
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
} 