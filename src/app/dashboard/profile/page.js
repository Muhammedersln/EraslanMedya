"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaShoppingBag, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Navbar from '@/components/navbar/Navbar';
import { motion } from 'framer-motion';

// Stat kartı bileşeni
const StatCard = ({ icon: Icon, title, value, bgColor, iconColor, isLoading }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <FaSpinner className="w-4 h-4 text-gray-400 animate-spin" />
            <span className="text-gray-400">Yükleniyor...</span>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-semibold text-gray-900"
          >
            {value}
          </motion.p>
        )}
      </div>
    </div>
  </motion.div>
);

// Ana bileşen
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    lastOrderDate: null,
    recentOrders: [],
    totalAmount: 0
  });

  const fetchOrderStats = async () => {
    setIsStatsLoading(true);
    try {
      // Önce tüm siparişleri çekelim
      const ordersResponse = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!ordersResponse.ok) {
        throw new Error('Siparişler getirilemedi');
      }

      const orders = await ordersResponse.json();
      
      // Siparişleri işleyerek istatistikleri hesaplayalım
      const stats = {
        total: orders.length,
        completed: orders.filter(order => order.status === 'completed').length,
        processing: orders.filter(order => order.status === 'processing').length,
        lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
        recentOrders: orders.slice(0, 5).map(order => ({
          id: order._id,
          date: order.createdAt,
          status: order.status,
          amount: order.totalAmount
        })),
        totalAmount: orders.reduce((total, order) => total + (order.totalAmount || 0), 0)
      };

      setOrderStats(stats);
    } catch (error) {
      console.error('Sipariş istatistikleri yüklenirken hata:', error);
      toast.error('İstatistikler yüklenirken bir hata oluştu');
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      fetchOrderStats();

      // Her 30 saniyede bir istatistikleri güncelle
      const interval = setInterval(fetchOrderStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsPasswordLoading(true);

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Şifre değiştirme işlemi başarısız oldu');
      }

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Şifreniz başarıyla güncellendi');
      
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error);
      toast.error(error.message || 'Şifre güncellenirken bir hata oluştu');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profil güncelleme işlemi başarısız oldu');
      }

      toast.success('Profiliniz başarıyla güncellendi');
      
      // Update user context
      if (user) {
        user.firstName = profileData.firstName;
        user.lastName = profileData.lastName;
        user.email = profileData.email;
        user.phone = profileData.phone;
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error(error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setIsProfileLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* İstatistikler */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaShoppingBag className="w-5 h-5 text-primary" />
              Sipariş İstatistikleri
              {isStatsLoading && (
                <FaSpinner className="w-4 h-4 text-gray-400 animate-spin ml-2" />
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={FaShoppingBag}
                title="Toplam Sipariş"
                value={orderStats.total || 0}
                bgColor="bg-primary/10"
                iconColor="text-primary"
                isLoading={isStatsLoading}
              />

              <StatCard
                icon={FaCheckCircle}
                title="Tamamlanan"
                value={orderStats.completed || 0}
                bgColor="bg-green-50"
                iconColor="text-green-500"
                isLoading={isStatsLoading}
              />

              <StatCard
                icon={FaSpinner}
                title="İşlemde"
                value={orderStats.processing || 0}
                bgColor="bg-blue-50"
                iconColor="text-blue-500"
                isLoading={isStatsLoading}
              />

              <StatCard
                icon={FaClock}
                title="Son Sipariş"
                value={orderStats.lastOrderDate ? new Date(orderStats.lastOrderDate).toLocaleDateString('tr-TR') : '-'}
                bgColor="bg-yellow-50"
                iconColor="text-yellow-500"
                isLoading={isStatsLoading}
              />
            </div>

            {/* Son Siparişler ve Toplam Kazanç */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Siparişler</h3>
                {isStatsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <FaSpinner className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : orderStats.recentOrders?.length > 0 ? (
                  <div className="space-y-3">
                    {orderStats.recentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-primary">
                            ₺{order.amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status === 'completed' ? 'Tamamlandı' :
                             order.status === 'processing' ? 'İşlemde' : 'Bekliyor'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Henüz sipariş bulunmuyor</p>
                )}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Toplam Harcama</h3>
                {isStatsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <FaSpinner className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-3xl font-bold text-primary">
                      ₺{orderStats.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Toplam {orderStats.total || 0} sipariş</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Profil Bilgileri */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-primary" />
                </div>
                Profil Bilgileri
              </h2>
              <p className="text-sm text-gray-500 mt-1">Kişisel bilgilerinizi güncelleyin</p>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </p>
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  {isProfileLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      <span>Güncelleniyor...</span>
                    </>
                  ) : (
                    <>
                      <FaUser className="w-4 h-4" />
                      <span>Bilgileri Güncelle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Şifre Değiştirme */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FaLock className="w-4 h-4 text-primary" />
                </div>
                Şifre Değiştir
              </h2>
              <p className="text-sm text-gray-500 mt-1">Hesap güvenliğinizi artırın</p>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifre</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                        minLength={6}
                      />
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre (Tekrar)</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                        minLength={6}
                      />
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between mb-16">
                <p className="text-sm text-gray-500">
                  Şifrenizi değiştirdikten sonra yeniden giriş yapmanız gerekecektir
                </p>
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  {isPasswordLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      <span>Güncelleniyor...</span>
                    </>
                  ) : (
                    <>
                      <FaLock className="w-4 h-4" />
                      <span>Şifreyi Güncelle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 