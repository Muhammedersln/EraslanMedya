'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        
        if (!token || !email) {
          setVerificationStatus('error');
          setErrorMessage('Doğrulama bağlantısı geçersiz.');
          toast.error('Doğrulama bağlantısı geçersiz.');
          return;
        }

        // API'ye GET isteği yap
        const response = await fetch(`/api/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          toast.success('E-posta adresiniz başarıyla doğrulandı!');
          // 3 saniye sonra login sayfasına yönlendir
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(data.message || 'Doğrulama başarısız oldu.');
          toast.error(data.message || 'Doğrulama başarısız oldu.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center">
        {verificationStatus === 'verifying' && (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-800">E-posta Doğrulanıyor</h2>
            <p className="text-gray-600">Lütfen bekleyin...</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="space-y-4">
            <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-800">Doğrulama Başarılı!</h2>
            <p className="text-gray-600">
              E-posta adresiniz başarıyla doğrulandı. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="space-y-4">
            <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-800">Doğrulama Başarısız</h2>
            <p className="text-gray-600">
              {errorMessage || 'Doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir.'}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 