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
      await fetchOrders();
      setShowModal(false);
      toast.success('Sipariş durumu güncellendi!');
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      toast.error(error.message || 'Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sipariş silinirken bir hata oluştu');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Sipariş başarıyla silindi');
        fetchOrders();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Sipariş silinirken hata:', error);
      toast.error(error.message || 'Sipariş silinirken bir hata oluştu');
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
    <div className="p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-text">Siparişler</h1>
        <p className="text-sm md:text-base text-text-light">Tüm siparişleri yönetin</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="min-w-full">
          {/* Masaüstü Görünüm */}
          <table className="w-full hidden md:table">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {Array.isArray(orders) && orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-3 text-sm text-text">{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm text-text">{order.user?.username || 'Kullanıcı Silinmiş'}</td>
                  <td className="px-4 py-3 text-sm text-text">{order.product?.name || 'Ürün Silinmiş'}</td>
                  <td className="px-4 py-3 text-sm text-text">{order.quantity}</td>
                  <td className="px-4 py-3 text-sm text-text">₺{order.totalPrice}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[order.status].bg} ${STATUS_COLORS[order.status].text}`}>
                      {STATUS_COLORS[order.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button onClick={() => { setSelectedOrder(order); setShowModal(true); }} 
                            className="text-primary hover:text-primary-dark">
                      Düzenle
                    </button>
                    <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                            className="text-gray-600 hover:text-gray-900">
                      Detaylar
                    </button>
                    <button onClick={() => handleDelete(order._id)}
                            className="text-red-600 hover:text-red-700">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobil Görünüm */}
          <div className="md:hidden space-y-4">
            {Array.isArray(orders) && orders.map((order) => (
              <div key={order._id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">ID: {order._id.slice(-6).toUpperCase()}</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[order.status].bg} ${STATUS_COLORS[order.status].text}`}>
                        {STATUS_COLORS[order.status].label}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Kullanıcı:</span>
                    <span className="ml-2 text-sm">{order.user?.username || 'Kullanıcı Silinmiş'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ürün:</span>
                    <span className="ml-2 text-sm">{order.product?.name || 'Ürün Silinmiş'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Miktar:</span>
                    <span className="ml-2 text-sm">{order.quantity}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Toplam:</span>
                    <span className="ml-2 text-sm">₺{order.totalPrice}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t pt-3">
                  <button onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                          className="text-sm text-primary hover:text-primary-dark">
                    Düzenle
                  </button>
                  <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                          className="text-sm text-gray-600 hover:text-gray-900">
                    Detaylar
                  </button>
                  <button onClick={() => handleDelete(order._id)}
                          className="text-sm text-red-600 hover:text-red-700">
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modaller aynı kalacak şekilde devam ediyor... */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md mx-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
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

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md mx-auto overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
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