"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Siparişler yüklenemedi');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sipariş durumu güncellenemedi');
      }

      await response.json();
      toast.success('Sipariş durumu güncellendi');
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      console.error('Sipariş güncelleme hatası:', error);
      toast.error('Sipariş durumu güncellenirken bir hata oluştu');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sipariş silinirken bir hata oluştu');
      }

      toast.success('Sipariş başarıyla silindi');
      fetchOrders();
    } catch (error) {
      console.error('Sipariş silme hatası:', error);
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'processing':
        return 'İşleniyor';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
              <p className="text-gray-500 mt-1">Toplam {orders.length} sipariş</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürünler</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{order.user?.username || 'Silinmiş Kullanıcı'}</div>
                        <div className="text-gray-500">{order.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items?.map((item, index) => (
                          <div key={index}>
                            {item.product?.name || 'Silinmiş Ürün'} x {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{order.totalAmount?.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Detay
                      </button>
                      <button
                        onClick={() => handleDelete(order._id)}
                        disabled={deleting}
                        className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-gray-500">
              Henüz hiç sipariş bulunmuyor.
            </div>
          </div>
        )}

        {/* Order Status Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sipariş Durumunu Güncelle
                </h2>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Sipariş ID</p>
                  <p className="font-medium text-gray-900">#{selectedOrder._id.slice(-6)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="processing">İşleniyor</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={updatingStatus}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.status)}
                  disabled={updatingStatus}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sipariş Detayları
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Sipariş ID</p>
                    <p className="font-medium text-gray-900">#{selectedOrder._id.slice(-6)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Sipariş Tarihi</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Kullanıcı</p>
                    <p className="font-medium text-gray-900">{selectedOrder.user?.username || 'Silinmiş Kullanıcı'}</p>
                    {selectedOrder.user?.email && (
                      <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Durum</p>
                    <span className={`inline-flex px-2 py-1 text-sm rounded-full mt-1 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Detayları</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-medium text-gray-900">{item.product?.name || 'Silinmiş Ürün'}</span>
                          <span className="text-gray-500">x {item.quantity}</span>
                        </div>
                        
                        {item.productData && (
                          <div className="mt-3 space-y-2">
                            {item.product?.subCategory === 'followers' ? (
                              <div>
                                <p className="text-sm text-gray-500">Kullanıcı Adı</p>
                                <p className="font-medium break-all">
                                  {item.productData?.username || '-'}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm text-gray-500">Gönderiler</p>
                                <div className="mt-1 space-y-1">
                                  {item.productData?.links?.map((link, linkIndex) => (
                                    <div key={linkIndex} className="flex items-center gap-2">
                                      <span className="text-gray-500">{linkIndex + 1}.</span>
                                      <a 
                                        href={link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-primary/80 transition-colors break-all"
                                      >
                                        {link}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Toplam Tutar</p>
                    <p className="text-lg font-semibold text-primary">
                      ₺{selectedOrder.totalAmount?.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}