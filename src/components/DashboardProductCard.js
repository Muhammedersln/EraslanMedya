"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { API_URL } from '@/utils/constants';

export default function DashboardProductCard({ product, index, onCartUpdate }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showProductDataModal, setShowProductDataModal] = useState(false);
  const [productData, setProductData] = useState({
    username: '',
    link: ''
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath}`;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (product.subCategory === 'followers' && !productData.username) {
      setShowProductDataModal(true);
      return;
    }

    if ((product.subCategory === 'likes' || product.subCategory === 'views' || product.subCategory === 'comments') && !productData.link) {
      setShowProductDataModal(true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: product.minQuantity,
          productData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ürün sepete eklenemedi');
      }

      toast.success('Ürün sepete eklendi');
      setShowProductDataModal(false);
      setProductData({ username: '', link: '' });
      
      window.dispatchEvent(new Event('cartUpdated'));
      
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast.error(error.message || 'Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-[340px] flex flex-col"
        onClick={() => router.push(`/products/${product._id}`)}
      >
        <div className="relative h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              product.category === 'instagram' 
                ? 'bg-pink-100 text-pink-600'
                : 'bg-blue-100 text-blue-600'
            }`}>
              {product.category === 'instagram' ? 'Instagram' : 'TikTok'}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>

          <div className="mt-auto flex items-center gap-3">
            <button 
              onClick={handleAddToCart}
              disabled={loading}
              className={`flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 px-4 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span>{loading ? 'Ekleniyor...' : 'Sepete Ekle'}</span>
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <span className="text-lg font-bold text-primary whitespace-nowrap">
              ₺{product.price.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Product Data Modal */}
      <AnimatePresence>
        {showProductDataModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.subCategory === 'followers' ? 'Takipçi Bilgileri' : 
                   product.subCategory === 'likes' ? 'Beğeni Bilgileri' : 
                   product.subCategory === 'views' ? 'İzlenme Bilgileri' : 'Yorum Bilgileri'}
                </h3>
                <p className="text-gray-600">
                  {product.subCategory === 'followers' 
                    ? `${product.category === 'instagram' ? 'Instagram' : 'TikTok'} kullanıcı adınızı girin`
                    : `${product.category === 'instagram' ? 'Instagram gönderi' : 'TikTok video'} linkini girin`
                  }
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Önemli:</strong> İşlemin başarılı olabilmesi için hesabınızın gizlilik ayarlarının kapalı (hesabın herkese açık) olması gerekmektedir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {product.subCategory === 'followers' ? (
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      {product.category === 'instagram' ? 'Instagram' : 'TikTok'} Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={productData.username}
                      onChange={(e) => setProductData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="@kullaniciadi"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                      {product.category === 'instagram' ? 'Gönderi Linki' : 'Video Linki'}
                    </label>
                    <input
                      type="text"
                      id="link"
                      value={productData.link}
                      onChange={(e) => setProductData(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder={product.category === 'instagram' ? 'https://instagram.com/...' : 'https://tiktok.com/...'}
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                  <button
                    onClick={() => setShowProductDataModal(false)}
                    className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={loading}
                    className={`w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors duration-200 font-medium ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Ekleniyor...' : 'Sepete Ekle'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}