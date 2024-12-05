"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Bekliyor' },
  processing: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'İşleniyor' },
  completed: { bg: 'bg-green-50', text: 'text-green-600', label: 'Tamamlandı' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'İptal Edildi' }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        setShowModal(false);
        toast.success('Sipariş durumu güncellendi!');
      }
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      toast.error('Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Siparişler</h1>
        <p className="text-text-light">Tüm siparişleri yönetin</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Sipariş ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Kullanıcı</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Ürün</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Miktar</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Toplam</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Durum</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Tarih</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-light">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 text-sm text-text">
                  {order._id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4 text-sm text-text">
                  {order.user.username}
                </td>
                <td className="px-6 py-4 text-sm text-text">
                  {order.product.name}
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
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sipariş Düzenleme Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Sipariş Durumunu Güncelle
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-light">Sipariş ID</p>
                <p className="font-medium">{selectedOrder._id.slice(-6).toUpperCase()}</p>
              </div>

              <div>
                <p className="text-sm text-text-light">Kullanıcı</p>
                <p className="font-medium">{selectedOrder.user.username}</p>
              </div>

              <div>
                <p className="text-sm text-text-light">Ürün</p>
                <p className="font-medium">{selectedOrder.product.name}</p>
              </div>

              <div>
                <p className="text-sm text-text-light">Hedef URL</p>
                <p className="font-medium break-all">{selectedOrder.targetUrl}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Durum
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="processing">İşleniyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-text-light hover:text-text transition-colors"
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