"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function Support() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
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
      const response = await fetch('/api/support', {
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
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          priority: formData.priority
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Destek talebi gönderilemedi');
      }

      toast.success('Destek talebiniz başarıyla gönderildi');
      setFormData({
        subject: '',
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
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 mt-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
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
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Tarih</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Konu</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">Durum</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {myTickets.map((ticket) => (
                          <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {ticket.subject}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]?.bg || 'bg-gray-50'} ${STATUS_COLORS[ticket.status]?.text || 'text-gray-600'}`}>
                                {STATUS_COLORS[ticket.status]?.label || 'Bekliyor'}
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
                    <span className="text-sm font-medium text-gray-700">Konu</span>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="Destek talebinizin konusu"
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
                  className={`w-full py-3 px-6 text-white font-medium rounded-xl transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {isLoading ? 'Gönderiliyor...' : 'Destek Talebi Gönder'}
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  Destek talebiniz genellikle 24 saat içinde yanıtlanır.
                  Acil durumlarda yüksek öncelik seçeneğini kullanabilirsiniz.
                </p>
              </form>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Bize Ulaşın</h3>
            <p className="text-gray-600 mb-6">
              Destek talebiniz dışında bizimle doğrudan iletişime geçmek isterseniz:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">E-posta</h4>
                <p className="text-gray-600">destek@eraslanmedya.com</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Çalışma Saatleri</h4>
                <p className="text-gray-600">09:00 - 22:00</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Canlı Destek</h4>
                <p className="text-gray-600">7/24 Hizmetinizdeyiz</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {showTicketModal && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">Destek Talebi Detayları</h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Konu</p>
                  <p className="font-medium text-gray-900">{selectedTicket.subject}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedTicket.status]?.bg || 'bg-gray-50'} ${STATUS_COLORS[selectedTicket.status]?.text || 'text-gray-600'}`}>
                    {STATUS_COLORS[selectedTicket.status]?.label || 'Bekliyor'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Öncelik</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {selectedTicket.priority === 'high' ? 'Yüksek' :
                     selectedTicket.priority === 'normal' ? 'Normal' : 'Düşük'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Mesaj</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Yanıtlar</p>
                    <div className="space-y-3">
                      {selectedTicket.responses.map((response, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            response.isAdmin
                              ? 'bg-blue-50 ml-4'
                              : 'bg-gray-50 mr-4'
                          }`}
                        >
                          <p className="text-sm font-medium mb-1">
                            {response.isAdmin ? 'Destek Ekibi' : 'Siz'}
                          </p>
                          <p className="text-gray-700 text-sm">{response.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(response.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}