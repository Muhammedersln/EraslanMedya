'use client';

import { FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';

export default function VerificationPending() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaEnvelope className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          E-posta Doğrulaması Gerekli
        </h1>

        <p className="text-gray-600 mb-6">
          Hesabınızı aktifleştirmek için lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Doğrulama e-postası birkaç dakika içinde gelebilir. Spam klasörünüzü kontrol etmeyi unutmayın.
            </p>
          </div>

          <Link 
            href="/login"
            className="inline-block w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );
} 