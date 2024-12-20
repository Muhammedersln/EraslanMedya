"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin', {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      toast.error('İstatistikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
        <p className="text-text-light">Hoş geldiniz, {user?.firstName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-medium text-text-light mb-1">Toplam Kullanıcı</h3>
          <p className="text-xl sm:text-2xl font-bold text-primary">{stats.totalUsers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-medium text-text-light mb-1">Toplam Ürün</h3>
          <p className="text-xl sm:text-2xl font-bold text-primary">{stats.totalProducts}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-medium text-text-light mb-1">Toplam Sipariş</h3>
          <p className="text-xl sm:text-2xl font-bold text-primary">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-medium text-text-light mb-1">Toplam Gelir</h3>
          <p className="text-xl sm:text-2xl font-bold text-primary">
            ₺{stats.totalRevenue.toLocaleString('tr-TR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-text mb-4">Son Siparişler</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş ID</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                    <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürünler</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{order._id.slice(-6)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.username || 'Silinmiş Kullanıcı'}
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-900">
                        {order.items.map(item => item.product?.name || 'Silinmiş Ürün').join(', ')}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{order.totalAmount.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'completed' ? 'Tamamlandı' :
                           order.status === 'processing' ? 'İşleniyor' :
                           order.status === 'cancelled' ? 'İptal Edildi' :
                           'Beklemede'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 