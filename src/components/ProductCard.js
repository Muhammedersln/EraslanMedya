"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaInstagram, FaTiktok } from 'react-icons/fa';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProductDataModal, setShowProductDataModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    username: '',
    postCount: 1,
    links: ['']
  });
  
  const handlePostCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    const validCount = Math.min(10, Math.max(1, count));
    
    setProductData(prev => ({
      ...prev,
      postCount: validCount,
      links: Array(validCount).fill('') // Yeni link array'i oluştur
    }));
  };

  const handleLinkChange = (index, value) => {
    setProductData(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = value;
      return {
        ...prev,
        links: newLinks
      };
    });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Modal kontrolü
    if (!showProductDataModal) {
      setShowProductDataModal(true);
      return;
    }

    try {
      setLoading(true);

      // Validasyonlar
      if (product.subCategory === 'followers' && !productData.username) {
        toast.error('Lütfen kullanıcı adı girin');
        return;
      }

      if (product.subCategory !== 'followers') {
        if (!productData.postCount || productData.postCount < 1 || productData.postCount > 10) {
          toast.error('Gönderi sayısı 1 ile 10 arasında olmalıdır');
          return;
        }

        // Boş link kontrolü
        if (!productData.links || productData.links.some(link => !link || !link.trim())) {
          toast.error('Lütfen tüm gönderi linklerini girin');
          return;
        }
      }

      const requestData = {
        productId: product._id,
        quantity: product.minQuantity,
        productData: product.subCategory === 'followers' 
          ? { username: productData.username }
          : {
              postCount: productData.postCount,
              links: productData.links.filter(link => link && link.trim())
            }
      };

      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ürün sepete eklenemedi');
      }

      toast.success('Ürün sepete eklendi');
      setShowProductDataModal(false);
      setProductData({ username: '', postCount: 1, links: [''] });
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast.error(error.message || 'Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath}`;
  };

  const formatPrice = (price) => {
    return `₺${price.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getCategoryIcon = () => {
    switch (product.category) {
      case 'instagram':
        return <FaInstagram className="text-xl" />;
      case 'tiktok':
        return <FaTiktok className="text-xl" />;
      default:
        return null;
    }
  };

  // Modal içeriği
  const renderModalContent = () => {
    if (product.subCategory === 'followers') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {product.category === 'instagram' ? 'Instagram' : 'TikTok'} Kullanıcı Adı
          </label>
          <input
            type="text"
            value={productData.username}
            onChange={(e) => setProductData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
            placeholder="@kullaniciadi"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gönderi Sayısı (Maksimum 10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={productData.postCount}
            onChange={handlePostCountChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
            placeholder="Gönderi sayısı girin"
          />
          <p className="mt-1 text-sm text-gray-500">
            Her gönderiye {Math.floor(product.minQuantity / productData.postCount)} adet {
              product.subCategory === 'likes' ? 'beğeni' : 
              product.subCategory === 'views' ? 'izlenme' : 'yorum'
            } eklenecek
          </p>
        </div>

        {productData.links.map((link, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {index + 1}. Gönderi Linki
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => handleLinkChange(index, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
              placeholder={`${index + 1}. gönderi linkini girin`}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobil Tasarım */}
      <div className="md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col mx-2"
          onClick={() => router.push(`/products/${product._id}`)}
        >
          {/* Görsel Alanı */}
          <div className="relative aspect-[3/2] w-full group overflow-hidden">
            <Image
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Kategori Etiketleri */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {/* Ana Kategori */}
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded-lg">
                {product.category === 'instagram' ? (
                  <FaInstagram className="text-white text-sm" />
                ) : (
                  <FaTiktok className="text-white text-sm" />
                )}
              </div>

              {/* Alt Kategori */}
              <div className={`px-2.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm
                ${product.subCategory === 'followers' 
                  ? 'bg-indigo-500/70 text-white' 
                  : product.subCategory === 'likes' 
                  ? 'bg-rose-500/70 text-white'
                  : product.subCategory === 'views' 
                  ? 'bg-sky-500/70 text-white'
                  : 'bg-emerald-500/70 text-white'}`}
              >
                {product.subCategory === 'followers' ? 'Takipçi' :
                 product.subCategory === 'likes' ? 'Beğeni' :
                 product.subCategory === 'views' ? 'İzlenme' : 'Yorum'}
              </div>
            </div>

            {/* Fiyat Etiketi */}
            <div className="absolute bottom-2 right-2">
              <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-white/90 text-primary shadow-lg">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* İçerik Alanı */}
          <div className="p-3 flex-grow flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-grow">
              {product.description}
            </p>

            {/* Miktar Bilgisi */}
            <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500">Min</span>
                  <span className="text-xs font-semibold">{product.minQuantity}</span>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500">Max</span>
                  <span className="text-xs font-semibold">{product.maxQuantity}</span>
                </div>
              </div>
            </div>

            {/* Sepete Ekle Butonu */}
            <button 
              onClick={handleAddToCart}
              disabled={loading}
              className={`w-full bg-primary hover:bg-primary-dark text-white py-2.5 px-4 rounded-xl font-medium 
                transition-all duration-300 flex items-center justify-center gap-2 text-sm
                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ekleniyor...
                </span>
              ) : (
                <>
                  <span>Sepete Ekle</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Desktop Tasarım */}
      <div className="hidden md:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
          onClick={() => router.push(`/products/${product._id}`)}
        >
          {/* Mevcut desktop tasarımı buraya */}
          <div className="relative aspect-[3/2] w-full group overflow-hidden">
            <Image
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl" />
            
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-full text-sm font-medium backdrop-blur-sm 
                ${product.category === 'instagram' 
                  ? 'bg-pink-500/80 text-white' 
                  : 'bg-black/80 text-white'
                } flex items-center gap-1.5`}>
                {getCategoryIcon()}
                {product.category === 'instagram' ? 'Instagram' : 'TikTok'}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-sm font-medium backdrop-blur-sm
                ${product.subCategory === 'followers' ? 'bg-purple-500/80' :
                  product.subCategory === 'likes' ? 'bg-red-500/80' :
                  product.subCategory === 'views' ? 'bg-blue-500/80' :
                  'bg-green-500/80'} text-white`}>
                {product.subCategory === 'followers' ? 'Takipçi' :
                 product.subCategory === 'likes' ? 'Beğeni' :
                 product.subCategory === 'views' ? 'İzlenme' : 'Yorum'}
              </span>
            </div>

            <div className="absolute bottom-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-white/90 text-primary shadow-lg">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {product.description}
            </p>

            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Min</span>
                  <span className="text-sm font-semibold">{product.minQuantity}</span>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Max</span>
                  <span className="text-sm font-semibold">{product.maxQuantity}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={loading}
              className={`w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl font-medium 
                transition-all duration-300 flex items-center justify-center gap-2 text-base
                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ekleniyor...
                </span>
              ) : (
                <>
                  <span>Sepete Ekle</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative z-[1001]"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0H6m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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

      {/* Product Data Modal */}
      <AnimatePresence>
        {showProductDataModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-[1001] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.subCategory === 'followers' ? 'Takipçi Bilgileri' : 
                   product.subCategory === 'likes' ? 'Beğeni Bilgileri' : 
                   product.subCategory === 'views' ? 'İzlenme Bilgileri' : 'Yorum Bilgileri'}
                </h3>
                <p className="text-gray-600">
                  {product.subCategory === 'followers' 
                    ? `${product.category === 'instagram' ? 'Instagram' : 'TikTok'} kullanıcı adınızı girin`
                    : `${product.category === 'instagram' ? 'Instagram gönderi' : 'TikTok video'} linkini girin (Maksimum 10 gönderi)`
                  }
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
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
                  {renderModalContent()}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/80 rounded-b-3xl">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => setShowProductDataModal(false)}
                    className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium border border-gray-200"
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