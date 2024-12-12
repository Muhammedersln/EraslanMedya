"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/DashboardNavbar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaTrash, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import Footer from '@/components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState({ subtotal: 0, tax: 0, total: 0, taxDetails: [] });

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

  const handleCheckout = () => {
    router.push('/checkout');
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
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="relative h-16 w-16 flex-shrink-0">
                              <Image
                                src={getImageUrl(item.product.image)}
                                alt={item.product.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            
                            <div className="flex-grow min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
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
                      className="w-full mt-4 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Ödemeye Geç
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

      <Footer />
    </div>
  );
}