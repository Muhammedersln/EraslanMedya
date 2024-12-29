"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import toast from 'react-hot-toast';

export default function UserDetail() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('User data:', data); // Debug için
      setUserData(data);
    } catch (error) {
      console.error('Kullanıcı detayları yüklenirken hata:', error);
      toast.error('Kullanıcı detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?id=${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Kullanıcı başarıyla silindi');
        router.push('/admin/users');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı silinemedi');
      }
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      toast.error(error.message || 'Kullanıcı silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center text-gray-600">Kullanıcı bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kullanıcı Detayları</h1>
          <p className="mt-2 text-sm text-gray-600">Kullanıcı bilgileri ve istatistikleri</p>
        </div>
        <button
          onClick={handleDeleteUser}
          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
        >
          Kullanıcıyı Sil
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Bilgileri</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Ad Soyad</p>
            <p className="mt-1 font-medium text-gray-900">{userData.firstName} {userData.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kullanıcı Adı</p>
            <p className="mt-1 font-medium text-gray-900">@{userData.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">E-posta</p>
            <p className="mt-1 font-medium text-gray-900">{userData.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telefon</p>
            <p className="mt-1 font-medium text-gray-900">{userData.phone || 'Belirtilmemiş'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kayıt Tarihi</p>
            <p className="mt-1 font-medium text-gray-900">
              {new Date(userData.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">E-posta Durumu</p>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                userData.isEmailVerified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {userData.isEmailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Toplam Sipariş</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{userData.stats?.totalOrders || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Toplam Harcama</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">₺{userData.stats?.totalSpent?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Tamamlanan</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{userData.stats?.completedOrders || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Açık Talepler</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{userData.stats?.openTickets || 0}</p>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Son Siparişler</h2>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userData.orders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items?.[0]?.product?.name || 'Silinmiş Ürün'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{order.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'completed' ? 'Tamamlandı' :
                       order.status === 'pending' ? 'Bekliyor' : 'İptal Edildi'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {userData.orders?.map((order) => (
            <div key={order._id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="font-medium text-gray-900">
                  {order.items?.[0]?.product?.name || 'Silinmiş Ürün'}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status === 'completed' ? 'Tamamlandı' :
                   order.status === 'pending' ? 'Bekliyor' : 'İptal Edildi'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tutar:</span>
                  <span className="font-medium text-gray-900">₺{order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tarih:</span>
                  <span className="text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Tickets */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Destek Talepleri</h2>
        <div className="space-y-4">
          {!userData.supportTickets?.length ? (
            <p className="text-center py-4 text-gray-500">Henüz destek talebi bulunmuyor</p>
          ) : (
            userData.supportTickets.map((ticket) => (
              <div key={ticket._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{ticket.message}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ticket.status === 'open' ? 'Açık' : 'Kapalı'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
