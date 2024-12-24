'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initPayment = async () => {
      try {
        // Local storage'dan order details'i al
        const storedOrderDetails = localStorage.getItem('pendingOrderDetails');
        if (!storedOrderDetails) {
          toast.error('Sipariş detayları bulunamadı');
          router.push('/dashboard/cart');
          return;
        }

        const orderData = JSON.parse(storedOrderDetails);

        // Siparişi oluştur
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...orderData.orderData,
            status: 'pending',
            paymentStatus: 'pending'
          })
        });

        if (!orderResponse.ok) {
          throw new Error('Sipariş oluşturulamadı');
        }

        const savedOrder = await orderResponse.json();

        // IP adresini al
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();

        // PayTR token'ı al
        const paytrResponse = await fetch('/api/payment/paytr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            orderDetails: {
              ...orderData,
              id: savedOrder._id
            },
            userInfo: {
              email: orderData.email,
              ip
            }
          })
        });

        if (!paytrResponse.ok) {
          throw new Error('Ödeme başlatılamadı');
        }

        const { token } = await paytrResponse.json();
        setToken(token);
        localStorage.removeItem('pendingOrderDetails');
      } catch (error) {
        console.error('Payment initialization error:', error);
        toast.error('Ödeme başlatılırken bir hata oluştu');
        router.push('/dashboard/cart');
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başlatılamadı</h1>
          <p className="text-gray-600 mb-6">Lütfen tekrar deneyiniz.</p>
          <button
            onClick={() => router.push('/dashboard/cart')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Sepete Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen">
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${token}`}
          className="w-full h-full border-0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
} 