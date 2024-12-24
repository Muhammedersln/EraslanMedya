'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export default function PaymentForm({ orderDetails, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('OrderDetails received:', orderDetails);

      // Validate orderDetails
      if (!orderDetails?.totalAmount) {
        throw new Error('Sipariş tutarı eksik');
      }
      if (!orderDetails?.email) {
        throw new Error('E-posta adresi eksik');
      }
      if (!orderDetails?.items?.length) {
        throw new Error('Sipariş ürünleri eksik');
      }
      if (!orderDetails?.id) {
        throw new Error('Sipariş ID eksik');
      }

      // Format basket items
      const userBasket = orderDetails.items.map(item => ({
        name: item.product.name,
        price: Math.round(parseFloat(item.price) * 100),
        quantity: parseInt(item.quantity)
      }));

      // Log the basket for debugging
      console.log('UserBasket before sending to PayTR:', userBasket);

      // Calculate total amount in kuruş
      const amountInKurus = Math.round(parseFloat(orderDetails.totalAmount) * 100);
      console.log('Amount in kuruş before sending to PayTR:', amountInKurus);

      // Ödeme işlemini başlat
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: orderDetails.id,
          amount: amountInKurus,
          email: orderDetails.email,
          userName: orderDetails.firstName && orderDetails.lastName 
            ? `${orderDetails.firstName} ${orderDetails.lastName}`
            : orderDetails.email.split('@')[0],
          userPhone: orderDetails.phone || '05000000000',
          userAddress: orderDetails.address || 'Türkiye',
          userBasket,
          cartItems: orderDetails.items.map(item => ({
            product: item.product.id,
            quantity: item.quantity,
            price: parseFloat(item.price),
            productData: item.productData,
            targetCount: item.targetCount
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Payment initialization error:', data);
        throw new Error(data.error || 'Ödeme başlatılamadı');
      }

      if (data.status === 'success' && data.token) {
        // Show PayTR iframe
        setIframeUrl(`https://www.paytr.com/odeme/guvenli/${data.token}`);
        setShowIframe(true);
      } else {
        throw new Error(data.error || 'Ödeme token\'ı alınamadı');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Ödeme işlemi başlatılırken bir hata oluştu');
      toast.error(error.message || 'Ödeme işlemi başlatılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleIframeClose = useCallback(async () => {
    if (orderDetails?.id) {
      try {
        await fetch(`/api/payment/cancel/${orderDetails.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (error) {
        console.error('Error canceling order:', error);
      }
    }
    setShowIframe(false);
    setIframeUrl('');
  }, [orderDetails?.id]);

  // Listen for payment result message
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin === 'https://www.paytr.com') {
        const { status } = event.data;
        
        try {
          if (status === 'success') {
            // Ödeme durumunu kontrol et
            const response = await fetch(`/api/payment/check/${orderDetails.id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
              // Sipariş durumunu güncelle
              try {
                const updateResponse = await fetch(`/api/orders?id=${orderDetails.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({ status: 'processing' })
                });

                if (!updateResponse.ok) {
                  console.error('Error updating order status:', await updateResponse.text());
                  throw new Error('Sipariş durumu güncellenirken bir hata oluştu');
                }

                // Sepeti temizle
                try {
                  const clearCartResponse = await fetch('/api/cart/clear', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });

                  const clearCartData = await clearCartResponse.json();

                  if (!clearCartResponse.ok || !clearCartData.success) {
                    console.error('Error clearing cart:', clearCartData);
                    toast.error('Sepet temizlenirken bir hata oluştu');
                    return;
                  }

                  // Sepet başarıyla temizlendiyse
                  if (clearCartData.deletedCount > 0) {
                    // Sepet güncellendiğinde event tetikle
                    window.dispatchEvent(new Event('cartUpdated'));
                    
                    toast.success(data.message || 'Ödeme başarıyla tamamlandı');
                    // Sayfayı yenilemeden önce kısa bir bekleme ekleyelim
                    setTimeout(() => {
                      window.location.href = '/dashboard/orders';
                    }, 1500);
                  } else {
                    console.error('Cart items not deleted:', clearCartData);
                    toast.error('Sepet temizlenirken bir hata oluştu');
                  }
                } catch (error) {
                  console.error('Error clearing cart:', error);
                  toast.error('Sepet temizlenirken bir hata oluştu');
                }
              } catch (error) {
                console.error('Error updating order status:', error);
                toast.error('Sipariş durumu güncellenirken bir hata oluştu');
              }
            } else if (data.status === 'failed') {
              throw new Error(data.message || 'Ödeme başarısız oldu');
            } else {
              throw new Error('Ödeme durumu doğrulanamadı');
            }
          } else if (status === 'failed') {
            // Başarısız ödeme durumunda siparişi iptal et
            const cancelResponse = await fetch(`/api/payment/cancel/${orderDetails.id}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

            if (!cancelResponse.ok) {
              console.error('Error cancelling order:', await cancelResponse.text());
            }

            setError('Ödeme işlemi başarısız oldu');
            toast.error('Ödeme işlemi başarısız oldu');
            handleIframeClose();
          }
        } catch (error) {
          console.error('Payment status check error:', error);
          setError(error.message || 'Ödeme durumu kontrol edilirken bir hata oluştu');
          toast.error(error.message || 'Ödeme durumu kontrol edilirken bir hata oluştu');
          handleIframeClose();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleIframeClose, orderDetails?.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Ödeme</h2>
          <p className="text-sm text-gray-600">Güvenli ödeme için PayTR kullanılmaktadır.</p>
        </div>
        {!showIframe && (
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        {showIframe && (
          <button
            onClick={handleIframeClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showIframe ? (
        <iframe
          src={iframeUrl}
          className="w-full h-[600px] border-0"
          frameBorder="0"
        />
      ) : (
        <div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Sipariş Özeti</h3>
            <div className="space-y-2">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>₺{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Toplam</span>
                  <span>₺{orderDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              disabled={loading}
            >
              İptal
            </button>
            <button
              onClick={handlePayment}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 shadow-lg shadow-blue-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İleniyor...
                </span>
              ) : 'Ödeme Yap'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 