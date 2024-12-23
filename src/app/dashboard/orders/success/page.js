'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    toast.success('Ödeme işlemi başarıyla tamamlandı');
    // 3 saniye sonra orders sayfasına yönlendir
    const timeout = setTimeout(() => {
      router.push('/dashboard/orders');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Ödeme Başarılı!</h2>
        <p className="text-gray-600 mb-4">Ödemeniz başarıyla tamamlandı.</p>
        <p className="text-sm text-gray-500">Siparişlerim sayfasına yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
} 