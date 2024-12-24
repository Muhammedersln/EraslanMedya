'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const clearCartAndRedirect = async () => {
      try {
        // Sepeti temizle
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Oturum bulunamadı');
        }

        const response = await fetch('/api/cart/clear', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Sepet temizlenirken bir hata oluştu');
        }

        // Event'i tetikle
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Başarılı mesajı göster
        toast.success('Ödemeniz başarıyla tamamlandı! Siparişiniz hazırlanıyor.');
        
        // Siparişler sayfasına yönlendir
        setTimeout(() => {
          router.push('/dashboard/orders');
        }, 2000);
      } catch (error) {
        console.error('Payment success error:', error);
        toast.error('Bir hata oluştu, ancak ödemeniz alındı. Siparişlerinizi kontrol edebilirsiniz.');
        setTimeout(() => {
          router.push('/dashboard/orders');
        }, 2000);
      }
    };

    clearCartAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h1>
        <p className="text-gray-600 mb-6">
          Siparişiniz başarıyla oluşturuldu ve hazırlanmaya başlandı.
          Size email ile bilgilendirme yapılacaktır.
        </p>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-sm text-gray-500">
          Siparişlerim sayfasına yönlendiriliyorsunuz...
        </p>
      </div>
    </div>
  );
} 