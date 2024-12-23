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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        
        {!showIframe ? (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Ödeme Yap</h2>
            <div className="mb-4">
              <p className="text-lg">Toplam Tutar: {orderDetails?.totalAmount?.toFixed(2)} TL</p>
              <p className="text-sm text-gray-500 mt-2">
                Güvenli ödeme işleminiz PayTR altyapısı üzerinden gerçekleştirilecektir.
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                İptal
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
              className="absolute right-4 top-4 z-10 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={iframeUrl}
              className="w-full h-[600px] rounded-lg"
              frameBorder="0"
            />
          </div>
        )}
      </div>
    </div>
  );
} 