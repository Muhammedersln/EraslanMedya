"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/Footer';
import instagramPrivacy from '../../../../../public/images/instaFollowInfo.png';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState({
    username: '',
    postCount: 1,
    links: ['']
  });
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ürün bulunamadı');
      }

      const data = await response.json();
      setProduct(data);
      setQuantity(data.minQuantity || 1);
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
      toast.error(error.message || 'Ürün yüklenirken bir hata oluştu');
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (product) {
      setQuantity(product.minQuantity || 1);
      setProductData({ username: '', postCount: 1, links: [''] });
    }
  }, [product]);

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

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (quantity < product.minQuantity || quantity > product.maxQuantity) {
      toast.error(`Miktar ${product.minQuantity} ile ${product.maxQuantity} arasında olmalıdır`);
      return;
    }

    try {
      // Validation checks
      if (product.subCategory === 'followers' && !productData.username?.trim()) {
        toast.error('Lütfen kullanıcı adını girin');
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

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
          productData: product.subCategory === 'followers'
            ? { username: productData.username?.trim() }
            : {
              postCount: productData.postCount,
              links: productData.links.filter(link => link && link.trim())
            }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sepete eklenirken bir hata oluştu');
      }

      toast.success('Ürün sepete eklendi');
      setProductData({ username: '', postCount: 1, links: [''] });
      setCurrentStep(1); // Reset to first step after successful addition

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast.error(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/placeholder.svg';
    return imageUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Ürün bulunamadı</h2>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Ürünlere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 py-4 lg:py-8">
        <div className="max-w-5xl mx-auto">
          <nav className="mb-4 lg:mb-6">
            <button
              onClick={() => router.push('/products')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors gap-1.5 group"
            >
              <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ürünlere Dön
            </button>
          </nav>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 lg:gap-8 lg:p-6">
              {/* Sol Taraf - Ürün Görseli ve Bilgiler */}
              <div className="lg:col-span-1">
                <div className="relative w-full max-w-[300px] mx-auto lg:max-w-none aspect-square rounded-xl overflow-hidden bg-gray-50 group">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                    <Image
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                    {product.category === 'instagram' ? 'Instagram' : 'TikTok'}
                  </span>
                </div>

                {/* Mobil için fiyat ve başlık */}
                <div className="mt-4 lg:hidden">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Fiyat:</span>
                    <span className="text-2xl font-bold text-primary">₺{product.price}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50/50 backdrop-blur-sm rounded-xl p-4 lg:p-5 border border-gray-100/80">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Önemli Bilgiler
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span>Min. Sipariş: <span className="font-medium text-gray-900">{product.minQuantity}</span></span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span>Max. Sipariş: <span className="font-medium text-gray-900">{product.maxQuantity}</span></span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span>Hızlı Teslimat</span>
                      </li>
                    </ul>
                  </div>

                  {/* Progress Steps - Mobile için düzenlendi */}
                  {user && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
                      <div className="relative">
                        <div className="h-2 mb-4 lg:mb-6 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            style={{ width: `${(currentStep / (product.category === 'instagram' && product.subCategory === 'followers' ? 3 : 2)) * 100}%` }}
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs lg:text-sm">
                          <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center mb-1 lg:mb-2 transition-colors duration-300 ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                              1
                            </div>
                            <span className="font-medium">Bilgi</span>
                          </div>
                          {product.category === 'instagram' && product.subCategory === 'followers' ? (
                            <>
                              <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center mb-1 lg:mb-2 transition-colors duration-300 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                  2
                                </div>
                                <span className="font-medium">Ayarlar</span>
                              </div>
                              <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center mb-1 lg:mb-2 transition-colors duration-300 ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                  3
                                </div>
                                <span className="font-medium">Onay</span>
                              </div>
                            </>
                          ) : (
                            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                              <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center mb-1 lg:mb-2 transition-colors duration-300 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                2
                              </div>
                              <span className="font-medium">Onay</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ Taraf - Sipariş Detayları */}
              <div className="lg:col-span-2">
                <div className="max-w-2xl">
                  {/* Desktop için başlık ve fiyat - mobilde gizli */}
                  <div className="hidden lg:flex flex-wrap items-start justify-between gap-4 mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Fiyat:</span>
                      <span className="text-2xl font-bold text-primary">₺{product.price}</span>
                    </div>
                  </div>

                  {!user ? (
                    // Giriş yapmamış kullanıcı için görünüm - Mobile uyumlu
                    <div className="space-y-4 lg:space-y-8">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Sipariş Gereksinimleri</h3>
                        <div className="space-y-4 lg:space-y-6">
                          <div className="bg-gray-50 rounded-xl p-4 lg:p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Sipariş Miktarı
                            </label>
                            <div className="flex items-center justify-center gap-4 bg-white p-3 lg:p-4 rounded-lg border border-gray-200">
                              <button
                                onClick={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <div className="w-20 lg:w-24 text-center">
                                <span className="text-xl font-semibold text-gray-900">{quantity}</span>
                                <p className="text-xs text-gray-500 mt-1">adet</p>
                              </div>
                              <button
                                onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobil için sabit alt bar */}
                      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:relative lg:border-0 lg:p-0 lg:bg-transparent">
                        <div className="flex items-center justify-between max-w-5xl mx-auto">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Toplam Tutar</p>
                            <p className="text-xl font-bold text-primary">₺{product.price * quantity}</p>
                          </div>
                          <button
                            onClick={() => setShowAuthModal(true)}
                            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all hover:scale-102 active:scale-98 shadow-lg shadow-primary/20"
                          >
                            Sepete Ekle
                          </button>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-20 lg:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Detayları</h3>
                        <div className="prose prose-sm max-w-none">
                          <div className="bg-gray-50 rounded-xl p-4 lg:p-5">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Giriş yapmış kullanıcı için aşamalı görünüm
                    <div className="space-y-6">
                      {currentStep === 1 && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                          {/* Ürün Bilgileri Kartı */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 sm:p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Detayı</h3>
                              <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Sipariş Formu */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 sm:p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sipariş Detayı</h3>
                              
                              <div className="space-y-6">
                                {product.subCategory === 'followers' ? (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      {product.category === 'instagram' ? 'Instagram' : 'TikTok'} Kullanıcı Adı
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                                      <input
                                        type="text"
                                        value={productData.username}
                                        onChange={(e) => setProductData(prev => ({ ...prev, username: e.target.value }))}
                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        placeholder="kullaniciadi"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    {/* Gönderi Sayısı Seçici */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Gönderi Sayısı
                                      </label>
                                      <div className="relative">
                                        <select
                                          value={productData.postCount}
                                          onChange={(e) => {
                                            const num = parseInt(e.target.value);
                                            setProductData(prev => ({
                                              ...prev,
                                              postCount: num,
                                              links: Array(num).fill('')
                                            }));
                                          }}
                                          className="w-full p-3 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        >
                                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                            <option key={num} value={num}>
                                              {num} Gönderi
                                            </option>
                                          ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </div>
                                      </div>
                                      <div className="mt-3 text-sm text-gray-600 flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-100">
                                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="leading-snug">
                                          Seçtiğiniz gönderi sayısına göre toplam beğeni miktarı eşit olarak dağıtılacaktır
                                        </p>
                                      </div>
                                    </div>

                                    {/* Gönderi Linkleri */}
                                    <div className="space-y-4">
                                      {productData.links.map((link, index) => (
                                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {index + 1}. Gönderi Linki
                                          </label>
                                          <div className="relative">
                                            <input
                                              type="url"
                                              value={link}
                                              onChange={(e) => handleLinkChange(index, e.target.value)}
                                              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                              placeholder="https://instagram.com/p/..."
                                            />
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Miktar Seçici */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Sipariş Miktarı
                                  </label>
                                  <div className="flex items-center justify-center gap-4 bg-white p-3 rounded-lg">
                                    <button
                                      onClick={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                                      className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary hover:text-primary text-xl font-medium"
                                    >
                                      -
                                    </button>
                                    <div className="w-32 text-center">
                                      <span className="text-2xl font-semibold text-gray-900">{quantity}</span>
                                      <p className="text-sm text-gray-500 mt-1">sipariş adedi</p>
                                    </div>
                                    <button
                                      onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                                      className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary hover:text-primary text-xl font-medium"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* İleri Butonu */}
                          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 mt-6">
                            <button
                              onClick={() => {
                                if (product.subCategory === 'followers' && !productData.username?.trim()) {
                                  toast.error('Lütfen kullanıcı adını girin');
                                  return;
                                }

                                if (product.subCategory !== 'followers') {
                                  if (!productData.postCount || productData.postCount < 1 || productData.postCount > 10) {
                                    toast.error('Gönderi sayısı 1 ile 10 arasında olmalıdır');
                                    return;
                                  }

                                  if (!productData.links || productData.links.some(link => !link || !link.trim())) {
                                    toast.error('Lütfen tüm gönderi linklerini girin');
                                    return;
                                  }
                                }

                                setCurrentStep(2);
                              }}
                              className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transform hover:scale-102 active:scale-98 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                              <span>Devam Et</span>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <>
                          {product.category === 'instagram' && product.subCategory === 'followers' ? (
                            // Instagram takipçi için ayarlar adımı
                            <div className="space-y-6">
                              <div className="p-6 bg-gray-50 rounded-lg space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">Önemli Ayarlar</h3>

                                <div className="space-y-6">
                                  {/* 1. Gizlilik Ayarı */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">1. Hesap Gizlilik Ayarı</h4>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                      <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <p className="text-gray-700">İnstagram Takipçi alabilmek için hesabınızın <span className="font-medium">herkese açık (public)</span> olması gerekmektedir.</p>
                                          <div className="mt-2">

                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <label className="flex items-start space-x-3">
                                        <input
                                          type="checkbox"
                                          className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                          checked={privacyConfirmed}
                                          onChange={(e) => setPrivacyConfirmed(e.target.checked)}
                                        />
                                        <span className="text-sm text-gray-600">
                                          Hesabımın gizlilik ayarlarını kontrol ettim ve herkese açık olduğunu onaylıyorum.
                                        </span>
                                      </label>
                                    </div>
                                  </div>

                                  {/* 2. Değerlendirme Ayarı */}
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-gray-800 text-lg flex items-center gap-2">
                                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm">2</span>
                                      Değerlendirme Ayarı
                                    </h4>

                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                      <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <p className="text-gray-700 font-medium">
                                              Instagram takipçi hizmetini kullanabilmek için değerlendirme özelliğinin kapalı olması gerekmektedir.
                                            </p>
                                            <p className="text-gray-600">
                                              Aşağıdaki görselde gösterildiği gibi değerlendirme ayarını kapatmanız önemlidir:
                                            </p>
                                          </div>

                                          <div className="relative group">
                                            <Image
                                              src={instagramPrivacy}
                                              alt="Instagram Değerlendirme Ayarı"
                                              width={400}
                                              height={250}
                                              className="w-full max-w-[300px] mx-auto lg:max-w-[400px] rounded-lg border border-gray-200 shadow-md transition-transform group-hover:scale-[1.02]"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          className="mt-1 h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                                          checked={reviewConfirmed}
                                          onChange={(e) => setReviewConfirmed(e.target.checked)}
                                        />
                                        <span className="text-sm text-gray-700">
                                          Değerlendirme ayarlarını kontrol ettim ve kapattığımı onaylıyorum.
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                  <button
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Geri
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!privacyConfirmed || !reviewConfirmed) {
                                        toast.error('Lütfen tüm ayarları kontrol edip onaylayın');
                                        return;
                                      }
                                      setCurrentStep(3);
                                    }}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                  >
                                    İleri
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Diğer ürünler için onay adımı
                            <div className="space-y-6">
                              <div className="p-6 bg-gray-50 rounded-lg space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Sipariş Özeti</h3>

                                <div className="space-y-3">
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Ürün</span>
                                    <span className="font-medium">{product.name}</span>
                                  </div>

                                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Miktar</span>
                                    <span className="font-medium">{quantity}</span>
                                  </div>

                                  {product.subCategory !== 'followers' && (
                                    <>
                                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Gönderi Sayısı</span>
                                        <span className="font-medium">{productData.postCount}</span>
                                      </div>
                                      <div className="py-2 border-b border-gray-200">
                                        <span className="text-gray-600 block mb-2">Gönderiler</span>
                                        <div className="space-y-1">
                                          {productData.links.map((link, index) => (
                                            <div key={index} className="text-sm text-gray-800 break-all">
                                              {index + 1}. {link}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Toplam Tutar</span>
                                    <span className="text-xl font-medium text-primary">₺{product.price}</span>
                                  </div>
                                </div>

                                <div className="mt-6 flex justify-between">
                                  <button
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Geri
                                  </button>
                                  <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${addingToCart ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'
                                      }`}
                                  >
                                    {addingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {currentStep === 3 && product.category === 'instagram' && product.subCategory === 'followers' && (
                        <div className="space-y-6">
                          <div className="p-6 bg-gray-50 rounded-lg space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Sipariş Özeti</h3>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Kullanıcı Adı</span>
                                <span className="font-medium">@{productData.username}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Takipçi Miktarı</span>
                                <span className="font-medium">{quantity}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Toplam Tutar</span>
                                <span className="text-xl font-medium text-primary">₺{product.price}</span>
                              </div>

                              {/* Ayar Onayları */}
                              <div className="mt-4 space-y-2 bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center text-sm text-green-600">
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Hesap gizliliği ayarı kontrol edildi</span>
                                </div>
                                <div className="flex items-center text-sm text-green-600">
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Değerlendirme ayarı kontrol edildi</span>
                                </div>
                              </div>

                              {/* Bilgilendirme Notu */}
                              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  Siparişiniz onaylandıktan sonra takipçiler hesabınıza <span className="font-medium">24</span> saat içerisinde eklenmeye başlayacaktır.
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-between">
                              <button
                                onClick={() => setCurrentStep(2)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Geri
                              </button>
                              <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${addingToCart ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'
                                  }`}
                              >
                                {addingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full shadow-lg m-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Giriş Yapın</h3>
              <p className="text-sm text-gray-600 mb-6">Devam etmek için lütfen giriş yapın veya hesap oluşturun.</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/login');
                  }}
                  className="w-full px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/register');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 text-sm rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Hesap Oluştur
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full text-gray-500 hover:text-gray-700 text-xs font-medium py-2"
                >
                  Vazgeç
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}