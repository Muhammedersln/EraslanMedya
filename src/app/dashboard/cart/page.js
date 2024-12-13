"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/DashboardNavbar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaTrash, FaShoppingCart, FaArrowRight, FaInstagram, FaTiktok } from 'react-icons/fa';
import Footer from '@/components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState({ subtotal: 0, tax: 0, total: 0, taxDetails: [] });
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCartItems();
  }, [user, router]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Sepet yüklenemedi');
      
      const data = await response.json();
      const validItems = data.filter(item => item.product);
      setCartItems(validItems);
      calculateTotal(validItems);
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
      toast.error('Sepet yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const validItems = items.filter(item => item.product);
    
    const subtotal = validItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
    
    const taxDetails = validItems.reduce((acc, item) => {
      const itemTotal = item.product.price * item.quantity;
      const taxRate = item.product.taxRate || 18;
      const itemTax = itemTotal * (taxRate / 100);
      
      if (!acc[taxRate]) {
        acc[taxRate] = {
          amount: 0,
          taxAmount: 0
        };
      }
      
      acc[taxRate].amount += itemTotal;
      acc[taxRate].taxAmount += itemTax;
      
      return acc;
    }, {});
    
    const totalTax = Object.values(taxDetails).reduce((sum, detail) => 
      sum + detail.taxAmount, 0);
    
    const roundedSubtotal = parseFloat(subtotal.toFixed(2));
    const roundedTax = parseFloat(totalTax.toFixed(2));
    const total = parseFloat((roundedSubtotal + roundedTax).toFixed(2));

    setTotalPrice({
      subtotal: roundedSubtotal,
      tax: roundedTax,
      total: total,
      taxDetails: Object.entries(taxDetails).map(([rate, detail]) => ({
        rate: Number(rate),
        amount: parseFloat(detail.amount.toFixed(2)),
        taxAmount: parseFloat(detail.taxAmount.toFixed(2))
      }))
    });
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(`${API_URL}/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) throw new Error('Miktar güncellenemedi');

      const updatedItems = cartItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      toast.success('Miktar güncellendi');
    } catch (error) {
      console.error('Miktar güncellenirken hata:', error);
      toast.error('Miktar güncellenirken bir hata oluştu');
    }
  };

  const updateProductData = async (itemId, productData) => {
    try {
      const item = cartItems.find(item => item._id === itemId);
      if (!item) return;

      const response = await fetch(`${API_URL}/api/cart/${itemId}`, {
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
      console.error('Bilgiler güncellenirken hata:', error);
      toast.error(error.message || 'Bilgiler güncellenirken bir hata oluştu');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${itemId}`, {
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
      console.error('Ürün silinirken hata:', error);
      toast.error('Ürün silinirken bir hata oluştu');
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Sipariş oluşturulamadı');
      }

      const orders = await response.json();
      toast.success('Siparişiniz başarıyla oluşturuldu!');
      router.push('/dashboard/orders'); // Siparişler sayfasına yönlendir
    } catch (error) {
      console.error('Checkout hatası:', error);
      toast.error('Sipariş oluşturulurken bir hata oluştu');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath}`;
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
      <DashboardNavbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-medium text-gray-900">Sepetim ({cartItems.length})</h1>
            </div>

            {cartItems.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
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
                              <div className="relative h-16 w-16 flex-shrink-0">
                                <Image
                                  src={getImageUrl(item.product.image)}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover rounded-md"
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

                            {/* Product Data Section */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-grow">
                                  {item.product.subCategory === 'followers' ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span className="font-medium">Kullanıcı Adı:</span>
                                      <span className="text-gray-900">{item.productData?.username || '-'}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span className="font-medium">
                                        {item.product.subCategory === 'likes' ? 'Beğeni' : 
                                         item.product.subCategory === 'views' ? 'İzlenme' : 'Yorum'} Linki:
                                      </span>
                                      <span className="text-gray-900 break-all">{item.productData?.link || '-'}</span>
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
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-medium mb-4">Özet</h2>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ara Toplam</span>
                        <span>₺{totalPrice.subtotal.toFixed(2)}</span>
                      </div>
                      
                      {totalPrice.taxDetails?.map(detail => (
                        <div key={detail.rate} className="flex justify-between text-gray-500">
                          <span>KDV ({detail.rate}%)</span>
                          <span>₺{detail.taxAmount.toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Toplam</span>
                          <span>₺{totalPrice.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                      className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </main>

      {/* Edit Product Data Modal */}
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
      </AnimatePresence>

      <Footer />
    </div>
  );
}