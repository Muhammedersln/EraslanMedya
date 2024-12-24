'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function PayTRPayment({ orderDetails, onClose }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const createOrder = useCallback(async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderDetails.orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sipariş oluşturulamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }, [orderDetails.orderData]);

  useEffect(() => {
    const getClientIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error('IP fetch error:', error);
        return '127.0.0.1';
      }
    };

    const initPayment = async () => {
      try {
        const ip = await getClientIp();
        
        // Önce siparişi oluştur
        const savedOrder = await createOrder();
        
        const response = await fetch('/api/payment/paytr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            orderDetails: {
              ...orderDetails,
              id: savedOrder._id // Kaydedilen siparişin ID'sini kullan
            },
            userInfo: {
              email: orderDetails.email,
              ip
            }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Ödeme başlatılamadı');
        }

        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Payment init error:', error);
        toast.error(error.message || 'Ödeme başlatılırken bir hata oluştu');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (showPayment) {
      initPayment();
    } else {
      setLoading(false);
    }
  }, [orderDetails, onClose, showPayment, createOrder]);

  const handleStartPayment = () => {
    setShowPayment(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Ödeme hazırlanıyor...</p>
      </div>
    );
  }

  if (!showPayment) {
    return (
      <div className="flex flex-col">
        <div className="mb-6">
          <div className="space-y-4">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-500">Miktar: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Ara Toplam</span>
                <span>₺{(orderDetails.totalAmount / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>KDV (%18)</span>
                <span>₺{(orderDetails.totalAmount - (orderDetails.totalAmount / 1.18)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Toplam</span>
                <span>₺{orderDetails.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Ödeme işleminiz güvenli bir şekilde PayTR altyapısı üzerinden gerçekleştirilecektir.
            </p>
          </div>

          <button
            onClick={handleStartPayment}
            className="w-full bg-primary text-white py-4 rounded-xl hover:bg-primary-dark transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>Ödemeye Geç</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">Ödeme başlatılamadı</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Kapat
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl">
        <div className="relative">
          <div className="h-[500px]">
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${token}`}
              className="w-full h-full border-0 rounded-xl"
              allowFullScreen
            ></iframe>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 