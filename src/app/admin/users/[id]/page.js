"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import toast from 'react-hot-toast';
import { API_URL } from '@/utils/constants';

export default function UserDetail() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);



  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Kullanıcı detayları yüklenirken hata:', error);
      toast.error('Kullanıcı detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const handleDeleteUser = async () => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Kullanıcı başarıyla silindi');
        router.push('/admin/users');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      toast.error('Kullanıcı silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4">
        <div className="text-center text-text">Kullanıcı bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Üst Ba��lık */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Kullanıcı Detayları</h1>
          <p className="text-text-light">Kullanıcı bilgileri ve istatistikleri</p>
        </div>
        <button
          onClick={handleDeleteUser}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Kullanıcıyı Sil
        </button>
      </div>

      {/* Kullanıcı Bilgileri Kartı */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Kullanıcı Bilgileri</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-text-light">Ad Soyad</p>
            <p className="font-medium">{userData.user.firstName} {userData.user.lastName}</p>
          </div>
          <div>
            <p className="text-text-light">Kullanıcı Adı</p>
            <p className="font-medium">@{userData.user.username}</p>
          </div>
          <div>
            <p className="text-text-light">E-posta</p>
            <p className="font-medium">{userData.user.email}</p>
          </div>
          <div>
            <p className="text-text-light">Telefon</p>
            <p className="font-medium">{userData.user.phone || 'Belirtilmemiş'}</p>
          </div>
          <div>
            <p className="text-text-light">Kayıt Tarihi</p>
            <p className="font-medium">{new Date(userData.user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <p className="text-text-light text-sm md:text-base">Toplam Sipariş</p>
          <p className="text-xl md:text-2xl font-bold">{userData.stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <p className="text-text-light text-sm md:text-base">Toplam Harcama</p>
          <p className="text-xl md:text-2xl font-bold">{userData.stats.totalSpent.toFixed(2)}₺</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <p className="text-text-light text-sm md:text-base">Tamamlanan</p>
          <p className="text-xl md:text-2xl font-bold">{userData.stats.completedOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <p className="text-text-light text-sm md:text-base">Açık Talepler</p>
          <p className="text-xl md:text-2xl font-bold">{userData.stats.openTickets}</p>
        </div>
      </div>

      {/* Siparişler */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Son Siparişler</h2>
        
        {/* Masaüstü için tablo görünümü */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-2 text-left">Ürün</th>
                <th className="px-4 py-2 text-left">Tutar</th>
                <th className="px-4 py-2 text-left">Durum</th>
                <th className="px-4 py-2 text-left">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {userData.orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-2">{order.product?.name || 'Silinmiş Ürün'}</td>
                  <td className="px-4 py-2">{order.totalPrice.toFixed(2)}₺</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'completed' ? 'Tamamlandı' :
                       order.status === 'pending' ? 'Bekliyor' : 'İptal Edildi'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobil için kart görünümü */}
        <div className="md:hidden space-y-4">
          {userData.orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{order.product?.name || 'Silinmiş Ürün'}</div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status === 'completed' ? 'Tamamlandı' :
                   order.status === 'pending' ? 'Bekliyor' : 'İptal Edildi'}
                </span>
              </div>
              <div className="text-sm text-text-light">
                <div className="flex justify-between items-center">
                  <span>Tutar:</span>
                  <span className="font-medium">{order.totalPrice.toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Tarih:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destek Talepleri */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Destek Talepleri</h2>
        <div className="space-y-4">
          {userData.supportTickets.length === 0 ? (
            <p className="text-text-light text-center py-4">Henüz destek talebi bulunmuyor</p>
          ) : (
            userData.supportTickets.map((ticket) => (
              <div key={ticket._id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{ticket.subject}</h3>
                    <p className="text-sm text-text-light mt-1 line-clamp-2">{ticket.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs self-start ${
                    ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status === 'open' ? 'Açık' : 'Kapalı'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-text-light">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
