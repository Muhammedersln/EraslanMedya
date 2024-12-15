"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SUPPORT_CATEGORIES = [
  { id: 'order_issue', name: 'Sipariş Sorunu' },
  { id: 'technical_issue', name: 'Teknik Sorun' },
  { id: 'payment_issue', name: 'Ödeme Sorunu' },
  { id: 'other', name: 'Diğer' }
];

const STATUS_COLORS = {
  open: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Açık' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'İşleniyor' },
  resolved: { bg: 'bg-green-50', text: 'text-green-600', label: 'Çözüldü' },
  closed: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Kapatıldı' }
};

export default function Support() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    orderId: '',
    message: '',
    priority: 'normal'
  });
  const [myTickets, setMyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  const fetchMyTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/support-tickets/my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Destek talepleri yüklenemedi');

      const data = await response.json();
      setMyTickets(data);
    } catch (error) {
      console.error('Destek talepleri yüklenirken hata:', error);
      toast.error('Destek talepleriniz yüklenirken bir hata oluştu');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/support-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Destek talebi gönderilemedi');
      }

      toast.success('Destek talebiniz başarıyla gönderildi');
      setFormData({
        category: '',
        orderId: '',
        message: '',
        priority: 'normal'
      });
      fetchMyTickets();
    } catch (error) {
      console.error('Destek talebi gönderme hatası:', error);
      toast.error(error.message || 'Destek talebi gönderilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <DashboardNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 mt-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-primary mb-4">Destek Merkezi</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Size nasıl yardımcı olabiliriz? Aşağıdaki formu doldurarak destek ekibimizle iletişime geçebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sol Taraf - Destek Talepleri Listesi */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                Destek Taleplerim
              </h2>
              
              {myTickets.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tarih</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kategori</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Durum</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {myTickets.map((ticket) => (
                          <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {SUPPORT_CATEGORIES.find(cat => cat.id === ticket.category)?.name}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status].bg} ${STATUS_COLORS[ticket.status].text}`}>
                                {STATUS_COLORS[ticket.status].label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowTicketModal(true);
                                }}
                                className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                              >
                                Detaylar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Henüz destek talebiniz bulunmuyor.</p>
                </div>
              )}
            </div>

            {/* Sağ Taraf - Yeni Destek Talebi Formu */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                Yeni Destek Talebi
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Sorun Kategorisi</span>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">Kategori Seçin</option>
                      {SUPPORT_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Sipariş ID (Opsiyonel)</span>
                    <input
                      type="text"
                      name="orderId"
                      value={formData.orderId}
                      onChange={handleInputChange}
                      placeholder="Örn: #123ABC"
                      className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Öncelik Seviyesi</span>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="low">Düşük</option>
                      <option value="normal">Normal</option>
                      <option value="high">Yüksek</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Mesajınız</span>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Lütfen sorununuzu detaylı bir şekilde açıklayın..."
                      className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-4 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Gönderiliyor...
                    </span>
                  ) : 'Destek Talebi Gönder'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Destek Talebi Detay Modal */}
      <AnimatePresence>
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Destek Talebi Detayı</h2>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Kategori</p>
                    <p className="text-lg font-medium text-gray-900">
                      {SUPPORT_CATEGORIES.find(cat => cat.id === selectedTicket.category)?.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Durum</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedTicket.status].bg} ${STATUS_COLORS[selectedTicket.status].text}`}>
                      {STATUS_COLORS[selectedTicket.status].label}
                    </span>
                  </div>
                </div>

                {selectedTicket.orderId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sipariş ID</p>
                    <p className="text-lg font-medium text-gray-900">#{selectedTicket.orderId}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Mesajınız</p>
                  <div className="bg-gray-50 p-4 rounded-xl text-gray-700">
                    {selectedTicket.message}
                  </div>
                </div>

                {selectedTicket.adminResponse && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Yanıt</p>
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-900">
                      {selectedTicket.adminResponse}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}