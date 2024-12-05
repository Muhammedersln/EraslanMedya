"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

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
      await login(formData.username, formData.password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Giriş hatası:', err);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl backdrop-blur-sm border border-secondary/10">
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
            className="w-full px-4 py-2.5 border border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
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
            className="w-full px-4 py-2.5 border border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
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
          <a href="#" className="text-sm text-primary hover:text-primary-dark transition-colors">
            Şifremi Unuttum
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-all duration-200 font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-light">
        Hesabınız yok mu?{" "}
        <a href="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
          Hemen Kayıt Olun
        </a>
      </div>
    </div>
  );
} 