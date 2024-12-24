'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export default function PaymentForm({ orderDetails, onClose }) {
  const [loading, setLoading] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate orderDetails
      if (!orderDetails?.id) {
        throw new Error('Sipariş ID eksik');
      }
      if (!orderDetails?.totalAmount) {
        throw new Error('Sipariş tutarı eksik');
      }
      if (!orderDetails?.email) {
        throw new Error('E-posta adresi eksik');
      }
      if (!orderDetails?.items?.length) {
        throw new Error('Sipariş ürünleri eksik');
      }

      // Format basket items
      const userBasket = orderDetails.items.map(item => ({
        name: item.product.name,
        price: item.price,
        quantity: item.quantity
      }));

      // Create payment request
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: orderDetails.id,
          amount: orderDetails.totalAmount,
          email: orderDetails.email,
          userName: orderDetails.firstName && orderDetails.lastName 
            ? `${orderDetails.firstName} ${orderDetails.lastName}`
            : orderDetails.email.split('@')[0],
          userPhone: orderDetails.phone || '05000000000',
          userAddress: orderDetails.address || 'Türkiye',
          userBasket,
          callbackUrl: `${window.location.origin}/dashboard/orders`
        })
      });

      const data = await response.json();

      if (!response.ok) {
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

  const handleIframeClose = useCallback(() => {
    setShowIframe(false);
    setIframeUrl('');
    setError(null);
    onClose?.();
  }, [onClose]);

  // Listen for payment result message
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin === 'https://www.paytr.com') {
        const { status } = event.data;
        if (status === 'success') {
          toast.success('Ödeme başarıyla tamamlandı');
          handleIframeClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-50 rounded-xl mx-6 mt-6 border border-red-100">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {!showIframe ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Ödeme Yap</h2>
            <div className="mb-8 space-y-4">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <p className="text-2xl font-semibold text-gray-800">{orderDetails?.totalAmount?.toFixed(2)} TL</p>
                <p className="text-sm text-gray-600 mt-2">Toplam Ödenecek Tutar</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  Güvenli ödeme işleminiz PayTR altyapısı üzerinden gerçekleştirilecektir.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
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
                    İşleniyor...
                  </span>
                ) : 'Ödeme Yap'}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={handleIframeClose}
              className="absolute right-4 top-4 z-10 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-lg transition-transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={iframeUrl}
              className="w-full h-[600px] rounded-xl"
              frameBorder="0"
            />
          </div>
        )}
      </div>
    </div>
  );
} 