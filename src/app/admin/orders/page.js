"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';
import { API_URL } from '@/utils/constants';
import { useRouter } from 'next/navigation';

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Bekliyor' },
  processing: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'İşleniyor' },
  completed: { bg: 'bg-green-50', text: 'text-green-600', label: 'Tamamlandı' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'İptal Edildi' }
};

export default function AdminOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Siparişler getirilemedi');
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      toast.error(error.message || 'Siparişler yüklenirken bir hata oluştu');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }

      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: selectedOrder.notes || '',
          startCount: selectedOrder.startCount || 0,
          currentCount: selectedOrder.currentCount || 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Sunucu hatası'
        }));
        throw new Error(errorData.message || 'Durum güncellenemedi');
      }

      const updatedOrder = await response.json();
      await fetchOrders(); // Siparişleri yeniden yükle
      setShowModal(false);
      toast.success('Sipariş durumu güncellendi!');
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      toast.error(error.message || 'Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Siparişler</h1>
        <p className="text-text-light">Tüm siparişleri yönetin</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sipariş ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ürün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Miktar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Toplam
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {Array.isArray(orders) && orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 text-sm text-text">
                  {order._id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4 text-sm text-text">
                  {order.user?.username || 'Kullanıcı Silinmiş'}
                </td>
                <td className="px-6 py-4 text-sm text-text">
                  {order.product?.name || 'Ürün Silinmiş'}
                </td>
                <td className="px-6 py-4 text-sm text-text">
                  {order.quantity}
                </td>
                <td className="px-6 py-4 text-sm text-text">
                  ₺{order.totalPrice}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[order.status].bg} ${STATUS_COLORS[order.status].text}`}>
                    {STATUS_COLORS[order.status].label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm space-x-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Detaylar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sipariş Düzenleme Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Sipariş Durumunu Güncelle
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Sipariş ID</p>
                <p className="font-medium">{selectedOrder._id.slice(-6).toUpperCase()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Kullanıcı</p>
                <p className="font-medium">{selectedOrder.user.username}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Ürün</p>
                <p className="font-medium">{selectedOrder.product.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="processing">İşleniyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea
                  value={selectedOrder.notes || ''}
                  onChange={(e) => setSelectedOrder({...selectedOrder, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder._id, selectedOrder.status)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sipariş Detay Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Sipariş Detayları
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Sipariş ID</p>
                <p className="font-medium">{selectedOrder._id.slice(-6).toUpperCase()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Kullanıcı</p>
                <p className="font-medium">{selectedOrder.user?.username || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Ürün</p>
                <p className="font-medium">{selectedOrder.product?.name || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Alt Kategori</p>
                <p className="font-medium">{selectedOrder.product?.subCategory || '-'}</p>
              </div>

              {selectedOrder.product?.subCategory === 'followers' ? (
                <div>
                  <p className="text-sm text-gray-500">Kullanıcı Adı</p>
                  <p className="font-medium break-all">
                    {selectedOrder.productData?.username || '-'}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Gönderi Sayısı</p>
                    <p className="font-medium">
                      {selectedOrder.productData?.postCount || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gönderiler</p>
                    <div className="mt-1 space-y-1">
                      {selectedOrder.productData?.links?.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">{index + 1}.</span>
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:text-primary-dark text-sm break-all"
                          >
                            {link}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-gray-500">Durum</p>
                <p className={`font-medium ${STATUS_COLORS[selectedOrder.status].text}`}>
                  {STATUS_COLORS[selectedOrder.status].label}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Notlar</p>
                <p className="font-medium whitespace-pre-wrap">
                  {selectedOrder.notes || '-'}
                </p>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 