"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Telefon numarası için sadece rakam girişine izin ver
    if (name === 'phone') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: onlyNums
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }

    // Şifre uzunluğu kontrolü
    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    // Telefon numarası kontrolü
    if (formData.phone.length !== 10) {
      toast.error('Geçerli bir telefon numarası giriniz!');
      return;
    }

    // Kullanım şartları kontrolü
    if (!formData.acceptTerms) {
      toast.error('Kullanım şartlarını kabul etmelisiniz!');
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        password: formData.password
      };

      const response = await register(userData);
      console.log('Register Success:', response);
      toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
      router.push('/dashboard');
    } catch (err) {
      console.log('Register Page Error:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Hata mesajını göster
      toast.error(err.message || 'Kayıt olurken bir hata oluştu!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center relative px-4">
        {/* Dekoratif arka plan elementleri */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        {/* Kayıt Formu */}
        <div className="w-full max-w-xl p-8 bg-white rounded-2xl shadow-xl backdrop-blur-sm border border-secondary/10 relative mt-20">
          <h2 className="text-2xl font-semibold text-primary mb-6">Hesap Oluştur</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1.5">
                  Ad
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border text-text border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                  placeholder="Adınız"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1.5">
                  Soyad
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border text-text border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                  placeholder="Soyadınız"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1.5">
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border text-text border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1.5">
                  Telefon
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light">
                    +90
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border text-text border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    placeholder="5XX XXX XX XX"
                    maxLength="10"
                    pattern="[0-9]*"
                    required
                  />
                </div>
              </div>
            </div>

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
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1.5">
                  Şifre Tekrar
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border text-text border-secondary-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary border-secondary-light rounded focus:ring-primary transition-colors"
              />
              <label className="ml-2 text-sm text-text-light">
                <span>Kullanım şartlarını ve </span>
                <a href="#" className="text-primary hover:text-primary-dark">gizlilik politikasını</a>
                <span> kabul ediyorum</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-all duration-200 font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-light">
            Zaten hesabınız var mı?{" "}
            <a href="/" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Giriş Yapın
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 