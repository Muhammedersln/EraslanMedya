'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FaLock } from 'react-icons/fa';
import Navbar from '@/components/navbar/Navbar';

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        router.push('/login');
      } else {
        throw new Error(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      toast.error(error.message || 'Şifre sıfırlama bağlantısı gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center relative px-4 py-12 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Forgot Password Form Card */}
        <div className="w-full max-w-md transform transition-all">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
            {/* Header with icon */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-primary-dark flex items-center justify-center">
                <FaLock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Şifremi Unuttum
              </h2>
            </div>

            <p className="text-gray-600 text-center">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-[0.99] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                    <span>Gönderiliyor...</span>
                  </div>
                ) : 'Şifre Sıfırlama Bağlantısı Gönder'}
              </button>

              <div className="text-center">
                <Link 
                  href="/login"
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Giriş sayfasına dön
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 