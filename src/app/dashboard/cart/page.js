"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/DashboardNavbar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

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
      const taxRate = item.product.taxRate || 18; // Default to 18% if not specified
      const itemTax = itemTotal * (taxRate / 100);
      
      // Group by tax rate
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
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Sepetim</h1>

          {cartItems.length > 0 ? (
            <div className="space-y-8">
              {/* Cart Items */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {cartItems.map((item) => {
                      if (!item.product) return null;
                      
                      return (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-6 flex items-center gap-6"
                        >
                          <div className="relative h-20 w-20 flex-shrink-0">
                            <Image
                              src={getImageUrl(item.product.image)}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">{item.product.description}</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            
                            <div className="w-24 text-right">
                              <div className="font-semibold">
                                ₺{(item.product.price * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ₺{item.product.price.toFixed(2)} / adet
                              </div>
                            </div>

                            <button
                              onClick={() => removeItem(item._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-semibold">₺{totalPrice.subtotal.toFixed(2)}</span>
                </div>
                
                {/* KDV detayları */}
                {totalPrice.taxDetails?.map(detail => (
                  <div key={detail.rate} className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">
                      KDV ({detail.rate}%)
                    </span>
                    <span className="font-semibold">₺{detail.taxAmount.toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="h-px bg-gray-100 my-4"></div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold">Toplam</span>
                  <span className="text-xl font-bold text-primary">₺{totalPrice.total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                >
                  Ödemeye Geç
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
              <p className="text-gray-600 mb-8">Sepetinizde henüz ürün bulunmuyor.</p>
              <button
                onClick={() => router.push('/dashboard/products')}
                className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Alışverişe Başla
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 