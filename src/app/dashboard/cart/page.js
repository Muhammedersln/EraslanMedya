"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navbar/Navbar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaTrash, FaShoppingCart, FaArrowRight, FaInstagram, FaTiktok } from 'react-icons/fa';
import Footer from '@/components/Footer';
import PayTRPayment from '@/components/PayTRPayment';

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState({ subtotal: 0, tax: 0, total: 0, taxDetails: [] });
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [settings, setSettings] = useState({ taxRate: 0.18 });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const calculateTotal = useCallback((items) => {
    const validItems = items.filter(item => item.product);
    
    const subtotal = validItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price);
      const quantity = parseInt(item.quantity);
      return sum + (price * quantity);
    }, 0);
    
    const roundedSubtotal = parseFloat(subtotal.toFixed(2));
    
    const taxRate = settings.taxRate;
    const taxAmount = parseFloat((roundedSubtotal * taxRate).toFixed(2));
    
    const total = parseFloat((roundedSubtotal + taxAmount).toFixed(2));

    setTotalPrice({
      subtotal: roundedSubtotal,
      tax: taxAmount,
      total: total,
      taxDetails: [{
        rate: parseFloat((taxRate * 100).toFixed(1)),
        amount: roundedSubtotal,
        taxAmount: taxAmount
      }]
    });
  }, [settings.taxRate]);

  const fetchCartItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sepet yüklenemedi');
      }
      
      const data = await response.json();
      const validItems = data.filter(item => item.product);
      setCartItems(validItems);
      calculateTotal(validItems);
    } catch (error) {
      toast.error('Sepet yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [calculateTotal]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'GET',
        cache: 'no-store'
      });

      const data = await response.json();
      setSettings({ taxRate: data.taxRate || 0.18 });
    } catch (error) {
      setSettings({ taxRate: 0.18 });
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCartItems();
    fetchSettings();
  }, [user, router, fetchCartItems, fetchSettings]);

  useEffect(() => {
    if (cartItems.length > 0) {
      calculateTotal(cartItems);
    }
  }, [settings, calculateTotal, cartItems]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Miktar güncellenemedi');
      }

      const updatedItem = await response.json();
      const updatedItems = cartItems.map(item => 
        item._id === itemId ? updatedItem : item
      );
      
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      toast.success('Miktar güncellendi');
    } catch (error) {
      toast.error(error.message || 'Miktar güncellenirken bir hata oluştu');
    }
  };

  const updateProductData = async (itemId, productData) => {
    try {
      const item = cartItems.find(item => item._id === itemId);
      if (!item) return;

      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quantity: item.quantity,
          productData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bilgiler güncellenemedi');
      }

      await fetchCartItems();
      
      setShowEditModal(false);
      setEditingItem(null);
      toast.success('Bilgiler güncellendi');
    } catch (error) {
      toast.error(error.message || 'Bilgiler güncellenirken bir hata oluştu');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Ürün silinemedi');

      const updatedItems = cartItems.filter(item => item._id !== itemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      toast.success('Ürün sepetten kaldırıldı');
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error('Ürün silinirken bir hata oluştu');
    }
  };

  const handleCheckout = async () => {
    try {
      const formattedItems = cartItems.map(item => ({
        product: item.product._id,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.product.price),
        taxRate: settings.taxRate,
        productData: item.productData,
        targetCount: parseInt(item.quantity)
      }));

      const orderDetails = {
        _id: `ORD${Date.now()}${Math.random().toString(36).substring(2, 7)}`,
        user: user._id,
        totalAmount: parseFloat(totalPrice.total.toFixed(2)),
        items: formattedItems
      };

      // Siparişi veritabanına kaydet
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderDetails)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sipariş oluşturulamadı');
      }

      const savedOrder = await response.json();
      
      // PayTR için gerekli bilgileri hazırla
      const paytrOrderDetails = {
        id: savedOrder._id,
        totalAmount: savedOrder.totalAmount,
        email: user.email,
        items: savedOrder.items.map(item => ({
          product: {
            id: item.product,
            name: cartItems.find(cartItem => cartItem.product._id === item.product)?.product.name || 'Ürün'
          },
          price: item.price,
          quantity: item.quantity
        }))
      };
      
      setOrderDetails(paytrOrderDetails);
      setShowPaymentForm(true);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Sipariş oluşturulurken bir hata oluştu');
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/placeholder.svg';
    return imageUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-4 sm:py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="lg:hidden">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Sepetim ({cartItems.length})</h1>
              </div>
              
              {cartItems.length > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <AnimatePresence>
                      {cartItems.map((item) => {
                        if (!item.product) return null;
                        
                        return (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                                <Image
                                  src={getImageUrl(item.product.imageUrl)}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              </div>
                              
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                                  {item.product.category === 'instagram' ? (
                                    <FaInstagram className="text-pink-500" />
                                  ) : (
                                    <FaTiktok className="text-blue-500" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">₺{item.product.price.toFixed(2)}</div>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  className="w-6 h-6 rounded bg-white flex items-center justify-center hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="w-6 h-6 rounded bg-white flex items-center justify-center hover:bg-gray-100"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => removeItem(item._id)}
                                  className="ml-2 text-gray-400 hover:text-red-500"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-grow">
                                  {item.product.subCategory === 'followers' ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span className="font-medium">Kullanıcı Adı:</span>
                                      <span className="text-gray-900">{item.productData?.username || '-'}</span>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-medium">Gönderi Sayısı:</span>
                                        <span className="text-gray-900">{item.productData?.postCount || '-'}</span>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Gönderiler:</span>
                                        <div className="mt-1 space-y-1">
                                          {item.productData?.links?.map((link, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                              <span className="text-gray-500">{index + 1}.</span>
                                              <a 
                                                href={link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-primary hover:text-primary-dark break-all"
                                              >
                                                {link}
                                              </a>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingItem({
                                      ...item,
                                      productData: item.productData || { username: '', link: '' }
                                    });
                                    setShowEditModal(true);
                                  }}
                                  className="text-primary hover:text-primary-dark text-sm font-medium ml-4"
                                >
                                  Düzenle
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h2 className="text-lg font-medium mb-4">Sipariş Özeti</h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Ara Toplam</span>
                        <span>₺{totalPrice.subtotal.toFixed(2)}</span>
                      </div>
                      
                      {totalPrice.taxDetails?.map(detail => (
                        <div key={detail.rate} className="flex justify-between text-sm sm:text-base text-gray-500">
                          <span>KDV ({detail.rate.toFixed(1)}%)</span>
                          <span>₺{detail.taxAmount.toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between font-medium text-base sm:text-lg">
                          <span>Toplam</span>
                          <span>₺{totalPrice.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                        className="w-full mt-4 bg-primary text-white py-3 sm:py-4 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                      >
                        Siparişi Onayla
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-4" />
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Sepetiniz Boş</h2>
                  <p className="text-gray-500 mb-6">Sepetinizde henüz ürün bulunmuyor.</p>
                  <button
                    onClick={() => router.push('/dashboard/products')}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Alışverişe Başla
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-2xl font-medium text-gray-900 mb-8">Sepetim ({cartItems.length})</h1>
            
            {cartItems.length > 0 ? (
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8">
                  <div className="bg-white rounded-xl shadow-sm">
                    <div className="divide-y divide-gray-100">
                      <AnimatePresence>
                        {cartItems.map((item) => {
                          if (!item.product) return null;
                          
                          return (
                            <motion.div
                              key={item._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="p-6 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex gap-6">
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                                  <Image
                                    src={getImageUrl(item.product.imageUrl)}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                  />
                                </div>
                                
                                <div className="flex-grow">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-lg text-gray-900">{item.product.name}</h3>
                                      {item.product.category === 'instagram' ? (
                                        <FaInstagram className="text-pink-500 text-xl" />
                                      ) : (
                                        <FaTiktok className="text-blue-500 text-xl" />
                                      )}
                                    </div>
                                    <div className="text-lg font-medium text-gray-900">
                                      ₺{(item.product.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                      <button
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                                      <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                                      >
                                        +
                                      </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={() => {
                                          setEditingItem({
                                            ...item,
                                            productData: item.productData || { username: '', link: '' }
                                          });
                                          setShowEditModal(true);
                                        }}
                                        className="text-primary hover:text-primary-dark font-medium"
                                      >
                                        Düzenle
                                      </button>
                                      <button
                                        onClick={() => removeItem(item._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <FaTrash size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    {item.product.subCategory === 'followers' ? (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-medium">Kullanıcı Adı:</span>
                                        <span className="text-gray-900">{item.productData?.username || '-'}</span>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <span className="font-medium">Gönderi Sayısı:</span>
                                          <span className="text-gray-900">{item.productData?.postCount || '-'}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">Gönderiler:</span>
                                          <div className="mt-1 space-y-1">
                                            {item.productData?.links?.map((link, index) => (
                                              <div key={index} className="flex items-center gap-2">
                                                <span className="text-gray-500">{index + 1}.</span>
                                                <a 
                                                  href={link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary-dark break-all"
                                          >
                                                  {link}
                                          </a>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="col-span-4">
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                    <h2 className="text-xl font-medium mb-6">Sipariş Özeti</h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">Ara Toplam</span>
                        <span className="font-medium">₺{totalPrice.subtotal.toFixed(2)}</span>
                      </div>
                      
                      {totalPrice.taxDetails?.map(detail => (
                        <div key={detail.rate} className="flex justify-between text-base text-gray-600">
                          <span>KDV ({detail.rate.toFixed(1)}%)</span>
                          <span>₺{detail.taxAmount.toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-lg font-medium">
                          <span>Toplam</span>
                          <span className="text-primary">₺{totalPrice.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                        className="w-full mt-6 bg-primary text-white py-4 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                      >
                        <span>Siparişi Onayla</span>
                        <FaArrowRight size={16} />
                      </button>

                      <p className="text-sm text-gray-500 text-center mt-4">
                        Siparişi onaylayarak satın alma koşullarını kabul etmiş olursunuz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FaShoppingCart className="mx-auto text-5xl text-gray-300 mb-6" />
                <h2 className="text-2xl font-medium text-gray-900 mb-3">Sepetiniz Boş</h2>
                <p className="text-gray-500 mb-8">Sepetinizde henüz ürün bulunmuyor.</p>
                <button
                  onClick={() => router.push('/dashboard/products')}
                  className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
                >
                  <span>Alışverişe Başla</span>
                  <FaArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {editingItem.product.subCategory === 'followers' ? 'Takipçi Bilgileri' : 
                   editingItem.product.subCategory === 'likes' ? 'Beğeni Bilgileri' : 
                   editingItem.product.subCategory === 'views' ? 'İzlenme Bilgileri' : 'Yorum Bilgileri'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {editingItem.product.subCategory === 'followers' 
                    ? `${editingItem.product.category === 'instagram' ? 'Instagram' : 'TikTok'} kullanıcı adınızı güncelleyin`
                    : `${editingItem.product.category === 'instagram' ? 'Instagram gönderi' : 'TikTok video'} linkini güncelleyin`
                  }
                </p>
              </div>

              <div className="space-y-4">
                {editingItem.product.subCategory === 'followers' ? (
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      {editingItem.product.category === 'instagram' ? 'Instagram' : 'TikTok'} Kullanıcı Adı
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={editingItem.productData?.username || ''}
                      onChange={(e) => {
                        setEditingItem({
                          ...editingItem,
                          productData: {
                            ...editingItem.productData,
                            username: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="@kullaniciadi"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                      {editingItem.product.category === 'instagram' ? 'Gönderi Linki' : 'Video Linki'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="link"
                      value={editingItem.productData?.link || ''}
                      onChange={(e) => {
                        setEditingItem({
                          ...editingItem,
                          productData: {
                            ...editingItem.productData,
                            link: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={editingItem.product.category === 'instagram' ? 'https://instagram.com/...' : 'https://tiktok.com/...'}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => {
                      const data = editingItem.product.subCategory === 'followers'
                        ? { username: editingItem.productData?.username?.trim() }
                        : { link: editingItem.productData?.link?.trim() };
                      updateProductData(editingItem._id, data);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showPaymentForm && orderDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <PayTRPayment
                orderDetails={orderDetails}
                onClose={() => {
                  setShowPaymentForm(false);
                  setOrderDetails(null);
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}