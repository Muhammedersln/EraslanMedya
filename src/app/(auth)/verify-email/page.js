"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('E-posta adresiniz doğrulanıyor...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setVerificationStatus('error');
          setMessage('Geçersiz doğrulama bağlantısı.');
          return;
        }

        const response = await fetch(`/api/verify-email?token=${token}&email=${email}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Doğrulama işlemi başarısız oldu.');
        }

        setVerificationStatus('success');
        setMessage(data.message || 'E-posta adresiniz başarıyla doğrulandı.');
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage(error.message || 'Doğrulama işlemi sırasında bir hata oluştu.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {verificationStatus === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Doğrulanıyor</h2>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 text-green-500">
                <FaCheckCircle className="w-full h-full" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Doğrulama Başarılı</h2>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                <FaTimesCircle className="w-full h-full" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Doğrulama Başarısız</h2>
            </>
          )}

          <p className="text-gray-600 mb-8">{message}</p>

          <div className="space-y-4">
            {verificationStatus !== 'verifying' && (
              <Link
                href="/login"
                className="block w-full bg-primary text-white py-3 px-4 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Giriş Yap
              </Link>
            )}
            
            {verificationStatus === 'error' && (
              <Link
                href="/register"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Kayıt Ol
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 