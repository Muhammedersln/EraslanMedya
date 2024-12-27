"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Navbar from '@/components/navbar/Navbar';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Geçersiz doğrulama bağlantısı.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          // 3 saniye sonra login sayfasına yönlendir
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Doğrulama işlemi sırasında bir hata oluştu.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg text-center">
          {status === 'verifying' && (
            <div className="animate-pulse">
              <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <h2 className="mt-6 text-xl font-medium text-gray-900">
                E-posta adresi doğrulanıyor...
              </h2>
            </div>
          )}

          {status === 'success' && (
            <div>
              <FaCheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="mt-6 text-xl font-medium text-gray-900">
                {message}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <FaTimesCircle className="w-16 h-16 mx-auto text-red-500" />
              <h2 className="mt-6 text-xl font-medium text-gray-900">
                {message}
              </h2>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Giriş sayfasına dön
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 