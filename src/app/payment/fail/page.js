'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PaymentFail() {
  const router = useRouter();

  useEffect(() => {
    // Hata mesajı göster
    toast.error('Ödeme işlemi başarısız oldu');
    
    // 3 saniye sonra sepet sayfasına yönlendir
    const timeout = setTimeout(() => {
      router.push('/dashboard/cart');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarısız!</h1>
        <p className="text-gray-600 mb-6">Ödeme işlemi sırasında bir hata oluştu.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Sepet sayfasına yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
} 