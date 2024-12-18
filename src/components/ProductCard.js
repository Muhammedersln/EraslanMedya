"use client";
import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { MdInfo, MdLink, MdInsertLink, MdNumbers, MdAdd, MdRemove } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';

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

      const response = await fetch('/api/cart', {
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
    if (!imagePath) return '/images/placeholder.svg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `/uploads/${imagePath}`;
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
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            {product.category === 'instagram' ? 
              <FaInstagram className="w-5 h-5 text-pink-500" /> : 
              <FaTiktok className="w-5 h-5 text-black" />
            }
            <span>Kullanıcı Adı</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUserCircle className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={productData.username}
              onChange={(e) => setProductData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
              placeholder="@kullaniciadi"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <MdInfo className="w-5 h-5 text-primary/70" />
            <p>Lütfen geçerli bir {product.category === 'instagram' ? 'Instagram' : 'TikTok'} kullanıcı adı girin</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <MdNumbers className="w-5 h-5 text-primary" />
            <span>Gönderi Sayısı (Maksimum 10)</span>
          </label>
          <div className="flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-xl">
            <button 
              onClick={() => handlePostCountChange({ target: { value: Math.max(1, productData.postCount - 1) }})}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-primary hover:text-white transition-colors"
            >
              <MdRemove className="w-5 h-5" />
            </button>
            
            <div className="w-16 text-center">
              <span className="text-2xl font-semibold text-gray-900">{productData.postCount}</span>
            </div>
            
            <button 
              onClick={() => handlePostCountChange({ target: { value: Math.min(10, productData.postCount + 1) }})}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-primary hover:text-white transition-colors"
            >
              <MdAdd className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <MdInfo className="w-5 h-5 text-primary/70" />
            <p>
              {product.subCategory === 'likes' ? 'Beğeniyi bölmek istediğiniz gönderi sayısı' : 
               product.subCategory === 'views' ? 'İzlenmeyi bölmek istediğiniz gönderi sayısı' :
               'Yorumu bölmek istediğiniz gönderi sayısı'}
            </p>
            </div>
        </div>

        {productData.links.map((link, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <MdLink className="w-5 h-5 text-primary" />
              <span>{index + 1}. Gönderi Linki</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder={`${index + 1}. gönderi linkini girin`}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <MdInsertLink className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    router.push(`/dashboard/products/${product._id}`);
  };

  // Auth Modal'ı portal ile render et
  const renderAuthModal = () => {
    if (!showAuthModal || typeof window === 'undefined') return null;

    return createPortal(
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1000] p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAuthModal(false);
          }
        }}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative z-[1001] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12 transform hover:rotate-0 transition-transform duration-300">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Hoş Geldiniz
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Hizmetlerimizden yararlanmak için lütfen giriş yapın veya yeni bir hesap oluşturun.
            </p>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowAuthModal(false);
                router.push('/login');
              }}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 px-6 rounded-2xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Giriş Yap</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowAuthModal(false);
                router.push('/register');
              }}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Yeni Hesap Oluştur</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAuthModal(false)}
              className="w-full text-gray-500 hover:text-gray-700 text-base mt-6 py-2 transition-colors duration-300"
            >
              Vazgeç
            </motion.button>
          </div>
        </motion.div>
      </div>,
      document.body
    );
  };

  // renderProductDataModal fonksiyonunu ekleyelim
  const renderProductDataModal = () => {
    if (!showProductDataModal || typeof window === 'undefined') return null;

    return createPortal(
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
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* Mobil Tasarım */}
      <div className="md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -5,
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-xl hover:border-primary/20 transition-all duration-300"
          onClick={handleCardClick}
        >
          {/* Görsel Alanı */}
          <div className="relative aspect-[3/2] w-full overflow-hidden group">
            <Image
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent group-hover:from-black/60 transition-all duration-300" />
            
            {/* Kategori Etiketleri */}
            <div className="absolute top-3 left-3 flex items-center gap-2 transition-transform duration-300 group-hover:translate-y-1">
              {/* Ana Kategori */}
              <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-full shadow-sm">
                {product.category === 'instagram' ? (
                  <FaInstagram className="text-pink-500 text-sm" />
                ) : (
                  <FaTiktok className="text-black text-sm" />
                )}
                <span className="text-sm font-medium">
                  {product.category === 'instagram' ? 'Instagram' : 'TikTok'}
                </span>
              </div>

              {/* Alt Kategori */}
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm
                ${product.subCategory === 'followers' ? 'bg-indigo-500' :
                  product.subCategory === 'likes' ? 'bg-rose-500' :
                  product.subCategory === 'views' ? 'bg-sky-500' :
                  'bg-emerald-500'}`}
              >
                {product.subCategory === 'followers' ? 'Takipçi' :
                 product.subCategory === 'likes' ? 'Beğeni' :
                 product.subCategory === 'views' ? 'İzlenme' : 'Yorum'}
              </div>
            </div>

            {/* Fiyat Etiketi */}
            <div className="absolute bottom-3 right-3 transition-transform duration-300 group-hover:translate-y-[-4px] group-hover:scale-105">
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="px-3 py-1.5 rounded-full text-sm font-bold bg-white shadow-sm text-primary"
              >
                {formatPrice(product.price)}
              </motion.span>
            </div>
          </div>

          {/* İçerik Alanı */}
          <div className="p-5 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
              {product.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {product.description}
            </p>

            {/* Miktar Bilgisi */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Min</span>
                  <span className="text-base font-bold text-primary">{product.minQuantity}</span>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Max</span>
                  <span className="text-base font-bold text-primary">{product.maxQuantity}</span>
                </div>
              </div>
            </motion.div>

            {/* Sepete Ekle Butonu */}
            <motion.button 
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  router.push(`/dashboard/products/${product._id}`);
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white py-3 px-4 rounded-xl font-medium 
                transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20
                hover:bg-primary-dark"
            >
              <span>Ürünü İncele</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Desktop Tasarım */}
      <div className="hidden md:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -5,
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-xl hover:border-primary/20 transition-all duration-300 mt-3"
          onClick={handleCardClick}
        >
          {/* Görsel Alanı */}
          <div className="relative aspect-[3/2] w-full overflow-hidden group">
            <Image
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent group-hover:from-black/60 transition-all duration-300" />
            
            {/* Kategori Etiketleri */}
            <div className="absolute top-3 left-3 flex items-center gap-2 transition-transform duration-300 group-hover:translate-y-1">
              {/* Ana Kategori */}
              <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-full shadow-sm">
                {product.category === 'instagram' ? (
                  <FaInstagram className="text-pink-500 text-sm" />
                ) : (
                  <FaTiktok className="text-black text-sm" />
                )}
                <span className="text-sm font-medium">
                  {product.category === 'instagram' ? 'Instagram' : 'TikTok'}
                </span>
              </div>

              {/* Alt Kategori */}
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm
                ${product.subCategory === 'followers' ? 'bg-indigo-500' :
                  product.subCategory === 'likes' ? 'bg-rose-500' :
                  product.subCategory === 'views' ? 'bg-sky-500' :
                  'bg-emerald-500'}`}
              >
                {product.subCategory === 'followers' ? 'Takipçi' :
                 product.subCategory === 'likes' ? 'Beğeni' :
                 product.subCategory === 'views' ? 'İzlenme' : 'Yorum'}
              </div>
            </div>

            {/* Fiyat Etiketi */}
            <div className="absolute bottom-3 right-3 transition-transform duration-300 group-hover:translate-y-[-4px] group-hover:scale-105">
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="px-3 py-1.5 rounded-full text-sm font-bold bg-white shadow-sm text-primary"
              >
                {formatPrice(product.price)}
              </motion.span>
            </div>
          </div>

          {/* İçerik Alanı */}
          <div className="p-5 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
              {product.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {product.description}
            </p>

            {/* Miktar Bilgisi */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Min</span>
                  <span className="text-base font-bold text-primary">{product.minQuantity}</span>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Max</span>
                  <span className="text-base font-bold text-primary">{product.maxQuantity}</span>
                </div>
              </div>
            </motion.div>

            {/* Sepete Ekle Butonu */}
            <motion.button 
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  router.push(`/dashboard/products/${product._id}`);
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white py-3 px-4 rounded-xl font-medium 
                transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20
                hover:bg-primary-dark"
            >
              <span>Ürünü İncele</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      {renderAuthModal()}

      {/* Product Data Modal */}
      {renderProductDataModal()}
    </>
  );
}