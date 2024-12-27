"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '@/components/navbar/Navbar';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      toast.error('Geçersiz şifre sıfırlama bağlantısı!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        router.push('/login');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
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

        {/* Reset Password Form Card */}
        <div className="w-full max-w-md transform transition-all">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 relative group hover:shadow-primary/10">
            {/* Header with icon */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-primary-dark flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <FaLock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Yeni Şifre Belirleme
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Güvenli bir şifre belirleyin
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Tips */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-medium text-blue-800">Güvenli Şifre İpuçları:</h3>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>En az 6 karakter uzunluğunda olmalı</li>
                  <li>Büyük ve küçük harfler içermeli</li>
                  <li>Sayı ve özel karakterler kullanın</li>
                </ul>
              </div>

              <div className="space-y-4">
                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Yeni Şifre
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Şifre Tekrar
                  </label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        formData.password.length < 6 
                          ? 'w-1/4 bg-red-500' 
                          : formData.password.length < 8
                            ? 'w-2/4 bg-yellow-500'
                            : 'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-600 text-right">
                    {formData.password.length < 6 
                      ? 'Zayıf' 
                      : formData.password.length < 8
                        ? 'Orta'
                        : 'Güçlü'} şifre
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-[0.99] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                    <span>İşleniyor...</span>
                  </div>
                ) : 'Şifreyi Güncelle'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 