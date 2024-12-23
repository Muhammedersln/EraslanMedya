"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FaUserCircle } from 'react-icons/fa';
import Navbar from '@/components/navbar/Navbar';

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(formData.username, formData.password);

      // Backend'den gelen yanıtı kontrol et
      if (response.status === 'error') {
        throw new Error(response.message);
      }

      // Admin kullanıcıları için e-posta doğrulamayı es geç
      if (response.user.role === 'admin') {
        toast.success('Admin girişi başarılı!');
        router.push('/admin')
        return;
      }

      // Normal kullanıcılar için e-posta doğrulama kontrolü
      if (!response.user.isEmailVerified) {
        toast.error('Lütfen önce e-posta adresinizi doğrulayın.');
        router.push('/verification-pending');
        return;
      }

      // Başarılı giriş
      toast.success('Giriş başarılı!');
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err.message || 'Giriş yapılırken bir hata oluştu!';

      if (errorMessage.toLowerCase().includes('e-posta') ||
        errorMessage.toLowerCase().includes('doğrula')) {
        toast.error('Lütfen önce e-posta adresinizi doğrulayın.');
        router.push('/verification-pending');
      } else {
        toast.error(errorMessage);
      }
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

        {/* Login Form Card */}
        <div className="w-full max-w-md transform transition-all">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
            {/* Header with icon */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-primary-dark flex items-center justify-center">
                <FaUserCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Giriş Yap
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200"
                  placeholder="Kullanıcı adınızı girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-600 hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    <span>Şifrenizi mi unuttunuz?</span>
                    <svg
                      className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-[0.99] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                    <span>Giriş yapılıyor...</span>
                  </div>
                ) : 'Giriş Yap'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">veya</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Hesabınız yok mu?{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 