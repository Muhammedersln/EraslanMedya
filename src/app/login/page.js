"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const { user, login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  // Eğer kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData.username, formData.password);
      console.log('Login Success:', response);

      if (response.user.role === 'admin') {
        toast.success('Admin paneline yönlendiriliyorsunuz...');
        router.replace('/admin');
      } else {
        toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error('Login Error:', err);
      toast.error(err.message || 'Giriş yapılırken bir hata oluştu!');
    }
  };

  // Eğer yükleme durumundaysa
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl backdrop-blur-sm border border-secondary/10 relative">
          <h2 className="text-2xl font-semibold text-primary mb-6">Giriş Yap</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1.5">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border text-text border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1.5">
                Şifre
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border text-text border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary border-secondary-light rounded focus:ring-primary transition-colors"
                />
                <label className="ml-2 text-sm text-text-light">
                  Beni Hatırla
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors">
                Şifremi Unuttum
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>

            <p className="text-center text-sm text-text-light">
              Hesabınız yok mu?{' '}
              <Link href="/register" className="text-primary hover:text-primary-dark transition-colors">
                Kayıt Ol
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
} 