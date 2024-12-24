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
        quantity: item.quantity
      }));

      // Ödeme işlemini başlat
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: orderDetails.id,
          amount: Math.round(parseFloat(orderDetails.totalAmount) * 100),
          email: orderDetails.email,
          userName: orderDetails.firstName && orderDetails.lastName 
            ? `${orderDetails.firstName} ${orderDetails.lastName}`
            : orderDetails.email.split('@')[0],
          userPhone: orderDetails.phone || '05000000000',
          userAddress: orderDetails.address || 'Türkiye',
          userBasket,
          callbackUrl: `${window.location.origin}/dashboard/orders`,
          cartItems: orderDetails.items.map(item => ({
            product: item.product.id,
            quantity: item.quantity,
            productData: item.productData,
            targetCount: item.targetCount
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Payment request details:', {
          orderId: orderDetails.id,
          amount: Math.round(parseFloat(orderDetails.totalAmount) * 100),
          email: orderDetails.email,
          userName: orderDetails.firstName && orderDetails.lastName 
            ? `${orderDetails.firstName} ${orderDetails.lastName}`
            : orderDetails.email.split('@')[0],
          userPhone: orderDetails.phone || '05000000000',
          userAddress: orderDetails.address || 'Türkiye',
          userBasket,
          callbackUrl: `${window.location.origin}/dashboard/orders`
        });
        console.error('Payment API error response:', data);
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

  const handleIframeClose = useCallback(() => {
    setShowIframe(false);
    setIframeUrl('');
  }, []);

  // Listen for payment result message
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin === 'https://www.paytr.com') {
        const { status } = event.data;
        if (status === 'success') {
          toast.success('Ödeme başarıyla tamamlandı');
          window.location.href = '/dashboard/orders';
        } else if (status === 'failed') {
          setError('Ödeme işlemi başarısız oldu');
          toast.error('Ödeme işlemi başarısız oldu');
          handleIframeClose();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleIframeClose]);

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