"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { API_URL } from '@/utils/constants';

const STATUS_COLORS = {
  open: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Açık' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'İşleniyor' },
  resolved: { bg: 'bg-green-50', text: 'text-green-600', label: 'Çözüldü' },
  closed: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Kapatıldı' }
};

export default function AdminSupport() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchTickets();
  }, [user, router]);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/support-tickets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Destek talepleri yüklenemedi');
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Destek talepleri yüklenirken hata:', error);
      toast.error(error.message || 'Destek talepleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/support-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: selectedTicket.adminNotes,
          adminResponse: selectedTicket.adminResponse
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Durum güncellenemedi');
      }

      await fetchTickets();
      setShowModal(false);
      toast.success('Destek talebi güncellendi');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error(error.message || 'Güncelleme sırasında bir hata oluştu');
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Bu destek talebini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/support-tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Destek talebi silinirken bir hata oluştu');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Destek talebi başarıyla silindi');
        fetchTickets();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Destek talebi silinirken hata:', error);
      toast.error(error.message || 'Destek talebi silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Destek Talepleri</h1>
        <p className="text-text-light">Müşteri destek taleplerini yönetin</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Öncelik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{ticket.user.username}</div>
                    <div className="text-sm text-gray-500">{ticket.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ticket.category === 'order_issue' && 'Sipariş Sorunu'}
                    {ticket.category === 'technical_issue' && 'Teknik Sorun'}
                    {ticket.category === 'payment_issue' && 'Ödeme Sorunu'}
                    {ticket.category === 'other' && 'Diğer'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ticket.priority === 'high' ? 'bg-red-50 text-red-600' :
                      ticket.priority === 'normal' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {ticket.priority === 'high' ? 'Yüksek' :
                       ticket.priority === 'normal' ? 'Normal' : 'Düşük'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[ticket.status].bg} ${STATUS_COLORS[ticket.status].text}`}>
                      {STATUS_COLORS[ticket.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowModal(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      Görüntüle
                    </button>
                    <button
                      onClick={() => handleDelete(ticket._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4 p-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{ticket.user.username}</div>
                  <div className="text-sm text-gray-500">{ticket.user.email}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[ticket.status].bg} ${STATUS_COLORS[ticket.status].text}`}>
                  {STATUS_COLORS[ticket.status].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Kategori:</span>
                  <span className="ml-1">
                    {ticket.category === 'order_issue' && 'Sipariş Sorunu'}
                    {ticket.category === 'technical_issue' && 'Teknik Sorun'}
                    {ticket.category === 'payment_issue' && 'Ödeme Sorunu'}
                    {ticket.category === 'other' && 'Diğer'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500">Öncelik:</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    ticket.priority === 'high' ? 'bg-red-50 text-red-600' :
                    ticket.priority === 'normal' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    {ticket.priority === 'high' ? 'Yüksek' :
                     ticket.priority === 'normal' ? 'Normal' : 'Düşük'}
                  </span>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-gray-500">Tarih:</span>
                <span className="ml-1">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowModal(true);
                  }}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Görüntüle
                </button>
                <button
                  onClick={() => handleDelete(ticket._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Destek Talebi Detayı</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kullanıcı</p>
                  <p className="font-medium">{selectedTicket.user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">E-posta</p>
                  <p className="font-medium">{selectedTicket.user.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Mesaj</p>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedTicket.message}</p>
              </div>

              {selectedTicket.orderId && (
                <div>
                  <p className="text-sm text-gray-500">Sipariş ID</p>
                  <p className="font-medium">#{selectedTicket.orderId}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusUpdate(selectedTicket._id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="open">Açık</option>
                  <option value="in_progress">İşleniyor</option>
                  <option value="resolved">Çözüldü</option>
                  <option value="closed">Kapatıldı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notları
                </label>
                <textarea
                  value={selectedTicket.adminNotes || ''}
                  onChange={(e) => setSelectedTicket({
                    ...selectedTicket,
                    adminNotes: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteriye Yanıt
                </label>
                <textarea
                  value={selectedTicket.adminResponse || ''}
                  onChange={(e) => setSelectedTicket({
                    ...selectedTicket,
                    adminResponse: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Kapat
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedTicket._id, selectedTicket.status)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 