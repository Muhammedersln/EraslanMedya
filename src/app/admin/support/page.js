"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  open: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Açık'
  },
  in_progress: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'İşleniyor'
  },
  resolved: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Çözüldü'
  },
  closed: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: 'Kapatıldı'
  }
};

const PRIORITY_COLORS = {
  high: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Yüksek'
  },
  normal: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Normal'
  },
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Düşük'
  }
};

export default function AdminSupport() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/support', {
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
      toast.error('Destek talepleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    if (!responseMessage.trim()) {
      toast.error('Lütfen bir yanıt yazın');
      return;
    }

    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          message: responseMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Destek talebi güncellenemedi');
      }

      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId ? data : ticket
        )
      );

      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(data);
      }

      toast.success('Yanıtınız gönderildi');
      setResponseMessage('');
      setShowModal(false);
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error(error.message || 'Destek talebi güncellenirken bir hata oluştu');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Bu destek talebini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Destek talebi silinemedi');
      }

      await response.json();
      
      setTickets(prevTickets => 
        prevTickets.filter(ticket => ticket._id !== ticketId)
      );

      toast.success('Destek talebi silindi');
      setShowModal(false);
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error(error.message || 'Destek talebi silinirken bir hata oluştu');
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
              <h1 className="text-2xl font-bold text-gray-900">Destek Talepleri</h1>
              <p className="text-gray-500 mt-1">Toplam {tickets.length} destek talebi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {/* Desktop Table - Hidden on Mobile */}
            <table className="w-full hidden lg:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öncelik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{ticket.user?.username || 'Silinmiş Kullanıcı'}</div>
                        <div className="text-gray-500">{ticket.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{ticket.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[ticket.priority]?.bg} ${PRIORITY_COLORS[ticket.priority]?.text}`}>
                        {PRIORITY_COLORS[ticket.priority]?.label || 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[ticket.status]?.bg} ${STATUS_COLORS[ticket.status]?.text}`}>
                        {STATUS_COLORS[ticket.status]?.label || 'Beklemede'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Görüntüle
                      </button>
                      <button
                        onClick={() => handleDelete(ticket._id)}
                        className="text-red-600 hover:text-red-500 transition-colors"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile and Tablet View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="p-4 sm:p-6 hover:bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[ticket.status]?.bg} ${STATUS_COLORS[ticket.status]?.text}`}>
                        {STATUS_COLORS[ticket.status]?.label || 'Beklemede'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[ticket.priority]?.bg} ${PRIORITY_COLORS[ticket.priority]?.text}`}>
                        {PRIORITY_COLORS[ticket.priority]?.label || 'Normal'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ticket.user?.username || 'Silinmiş Kullanıcı'}</div>
                      {ticket.user?.email && (
                        <div className="text-sm text-gray-500">{ticket.user.email}</div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-1">{ticket.subject}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{ticket.message}</div>
                    </div>

                    {ticket.responses?.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {ticket.responses.length} yanıt
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowModal(true);
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Görüntüle
                      </button>
                      <button
                        onClick={() => handleDelete(ticket._id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-gray-500">
              Henüz hiç destek talebi bulunmuyor.
            </div>
          </div>
        )}

        {/* Ticket Modal */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Destek Talebi Detayları
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Kullanıcı</p>
                    <p className="font-medium text-gray-900">{selectedTicket.user?.username || 'Silinmiş Kullanıcı'}</p>
                    {selectedTicket.user?.email && (
                      <p className="text-sm text-gray-500">{selectedTicket.user.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tarih</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedTicket.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Konu</p>
                  <p className="font-medium text-gray-900">{selectedTicket.subject}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Mesaj</p>
                  <p className="mt-1 text-gray-900 bg-gray-50 rounded-xl p-4">{selectedTicket.message}</p>
                </div>

                {selectedTicket.responses?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Yanıtlar</p>
                    <div className="space-y-4">
                      {selectedTicket.responses.map((response, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl ${
                            response.isAdmin
                              ? 'bg-blue-50 ml-6'
                              : 'bg-gray-50 mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">
                              {response.isAdmin ? 'Destek Ekibi' : 'Kullanıcı'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(response.createdAt).toLocaleString('tr-TR')}
                            </p>
                          </div>
                          <p className="text-gray-900">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yanıt</label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                    placeholder="Kullanıcıya yanıt yazın..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusUpdate(selectedTicket._id, e.target.value)}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
                  >
                    <option value="open">Açık</option>
                    <option value="in_progress">İşleniyor</option>
                    <option value="resolved">Çözüldü</option>
                    <option value="closed">Kapatıldı</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={updatingStatus}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 transition-colors disabled:opacity-50"
                >
                  Kapat
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedTicket._id, selectedTicket.status)}
                  disabled={updatingStatus || !responseMessage.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? 'Gönderiliyor...' : 'Yanıt Gönder'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 