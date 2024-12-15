"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/Navbar';
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
    postCount: 1,
    links: ['']
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

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
        throw new Error(error.message || 'Ürün sepete eklenemedi');
      }

      toast.success('Ürün sepete eklendi');
      setProductData({ username: '', postCount: 1, links: [''] });
      
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
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-6">
            <button 
              onClick={() => router.push('/products')}
              className="text-sm text-gray-600 hover:text-primary"
            >
              ← Ürünlere Dön
            </button>
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sol Taraf - Küçük Görsel */}
              <div className="md:col-span-1">
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-md text-xs font-medium text-gray-700">
                    {product.category === 'instagram' ? 'Instagram' : 'TikTok'}
                  </span>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Önemli Bilgiler</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Min. Sipariş: {product.minQuantity}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Max. Sipariş: {product.maxQuantity}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Hızlı Teslimat</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sağ Taraf - Sipariş Detayları */}
              <div className="md:col-span-2">
                <h1 className="text-2xl font-medium text-gray-900 mb-4">{product.name}</h1>
                
                <div className="space-y-6">
                  {/* Gereksinimler */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Sipariş Gereksinimleri</h3>
                    <div className="space-y-4">
                      {product.subCategory === 'followers' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {product.category === 'instagram' ? 'Instagram' : 'TikTok'} Kullanıcı Adı
                          </label>
                          <input
                            type="text"
                            value={productData.username}
                            onChange={(e) => setProductData(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                            placeholder="@kullaniciadi"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gönderi Sayısı (Maksimum 10)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={productData.postCount}
                              onChange={handlePostCountChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                              placeholder="Gönderi sayısı girin"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              Her gönderiye {Math.floor(quantity / productData.postCount)} adet {
                                product.subCategory === 'likes' ? 'beğeni' : 
                                product.subCategory === 'views' ? 'izlenme' : 'yorum'
                              } eklenecek
                            </p>
                          </div>

                          {productData.links.map((link, index) => (
                            <div key={index}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {index + 1}. Gönderi Linki
                              </label>
                              <input
                                type="url"
                                value={link}
                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                                placeholder={`${index + 1}. gönderi linkini girin`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Miktar
                        </label>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-16 text-center">{quantity}</span>
                          <button 
                            onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fiyat ve Sepete Ekle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Toplam Tutar</p>
                      <p className="text-2xl font-medium text-primary">₺{product.price}</p>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                        addingToCart ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'
                      }`}
                    >
                      {addingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
                    </button>
                  </div>

                  {/* Açıklama */}
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-gray-900 font-medium">Ürün Açıklaması</h3>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Giriş Yapın</h3>
              <p className="text-gray-600 mb-6">Devam etmek için lütfen giriş yapın veya hesap oluşturun.</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/login');
                  }}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/register');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  Hesap Oluştur
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}