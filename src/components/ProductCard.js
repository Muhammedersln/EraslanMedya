"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { API_URL } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent click from bubbling to parent
    
    if (!user) {
      router.push('/login');
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
          quantity: product.minQuantity
        })
      });

      if (!response.ok) {
        throw new Error('Ürün sepete eklenemedi');
      }

      toast.success('Ürün sepete eklendi');
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath}`;
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => router.push(`/products/${product._id}`)}
      >
        {/* Görsel Alanı */}
        <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
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

        {/* İçerik Alanı */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Min:</span>
              <span className="text-sm font-medium">{product.minQuantity}</span>
              <span className="text-xs text-gray-500 ml-2">Max:</span>
              <span className="text-sm font-medium">{product.maxQuantity}</span>
            </div>
            <span className="text-lg font-bold text-primary">
              ₺{product.price}
            </span>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={loading}
            className={`w-full bg-primary hover:bg-primary-dark text-white py-2.5 px-4 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
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
        </div>
      </motion.div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ürün Satın Almak İçin Giriş Yapın
            </h3>
            <p className="text-gray-600 mb-6">
              Bu ürünü satın almak için lütfen giriş yapın veya yeni bir hesap oluşturun.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/login');
                }}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 px-4 rounded-xl font-medium transition-colors duration-300"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/register');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-4 rounded-xl font-medium transition-colors duration-300"
              >
                Kayıt Ol
              </button>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              Vazgeç
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}