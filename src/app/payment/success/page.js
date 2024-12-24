'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Sepeti temizle
    fetch('/api/cart/clear', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(() => {
      // Event'i tetikle
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Başarılı mesajı göster
      toast.success('Ödeme başarıyla tamamlandı');
      
      // Siparişler sayfasına yönlendir
      router.push('/dashboard/orders');
    }).catch(error => {
      console.error('Error clearing cart:', error);
      router.push('/dashboard/orders');
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h1>
        <p className="text-gray-600 mb-6">Siparişiniz başarıyla oluşturuldu.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Siparişlerim sayfasına yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
} 