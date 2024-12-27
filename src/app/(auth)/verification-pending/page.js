'use client';

import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import Navbar from '@/components/navbar/Navbar';

export default function VerificationPending() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="flex justify-center">
              <FaEnvelope className="h-16 w-16 text-primary" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              E-posta Doğrulaması Gerekli
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hesabınızı aktifleştirmek için e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                E-posta kutunuzu kontrol edin ve spam klasörünü unutmayın.
              </p>
            </div>

            <div className="text-center">
              <Link 
                href="/login"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 