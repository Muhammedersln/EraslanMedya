"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navbar/Navbar';
import toast from 'react-hot-toast';
import Footer from '@/components/Footer';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { IoFunnelOutline } from 'react-icons/io5';

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Bekliyor' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'İşleniyor' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Tamamlandı' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'İptal Edildi' }
};

export default function Orders() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Siparişler getirilemedi');
      }

      const data = await response.json();
      const validOrders = data.filter(order => order.items?.length > 0 && order.items[0]?.product);
      setOrders(validOrders);
    } catch (error) {
      toast.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchOrders();
  }, [user, router, fetchOrders, loading]);

  // Table row için item render fonksiyonu
  const renderOrderItem = (item, index) => (
    <div key={index} className="flex justify-between items-center py-2">
      <span className="text-sm font-medium text-gray-900">{item.product?.name || 'Ürün bulunamadı'}</span>
      <span className="text-sm text-gray-600">x {item.quantity || 0}</span>
    </div>
  );

  // Desktop table için toplam ürün sayısı
  const getTotalItemCount = (items) => {
    return items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  // Ürün listesi için özet metin
  const getOrderSummary = (items) => {
    if (!items?.length) return 'Ürün bulunamadı';
    if (items.length === 1) return `${items[0].product?.name || 'Ürün'} x ${items[0].quantity}`;
    return `${items[0].product?.name || 'Ürün'} x ${items[0].quantity} +${items.length - 1} diğer`;
  };

  // Filtreleme ve sıralama fonksiyonları
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Status filtresi
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(query) ||
        order.items?.some(item => item.product?.name.toLowerCase().includes(query))
      );
    }

    // Sıralama
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount-desc':
          return b.totalAmount - a.totalAmount;
        case 'amount-asc':
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, statusFilter, searchQuery, sortBy]);

  if (loading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 sm:py-12 mt-16">
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mb-2">Siparişlerim</h1>
          <p className="text-gray-600 text-base sm:text-lg">Tüm siparişlerinizi görüntüleyin ve takip edin</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-8">
            {/* Filtreler ve Arama */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Sipariş ID veya ürün ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="hidden sm:block">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="all">Tüm Durumlar</option>
                      {Object.entries(STATUS_COLORS).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="hidden sm:block">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="date-desc">En Yeni</option>
                      <option value="date-asc">En Eski</option>
                      <option value="amount-desc">Fiyat: Yüksek → Düşük</option>
                      <option value="amount-asc">Fiyat: Düşük → Yüksek</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowFilters(true)}
                    className="sm:hidden px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    <IoFunnelOutline className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobil Filtre Modal */}
            {showFilters && (
              <div className="fixed inset-0 bg-black/50 flex items-end sm:hidden z-50">
                <div className="bg-white rounded-t-2xl w-full p-6 animate-slide-up">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Filtrele & Sırala</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duruma Göre Filtrele</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="all">Tüm Durumlar</option>
                        {Object.entries(STATUS_COLORS).map(([key, value]) => (
                          <option key={key} value={key}>{value.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sırala</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="date-desc">En Yeni</option>
                        <option value="date-asc">En Eski</option>
                        <option value="amount-desc">Fiyat: Yüksek → Düşük</option>
                        <option value="amount-asc">Fiyat: Düşük → Yüksek</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full bg-primary text-white py-3 rounded-xl font-medium mt-4"
                    >
                      Uygula
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sonuç Sayısı */}
            <div className="text-sm text-gray-500">
              {filteredAndSortedOrders.length} sipariş bulundu
              {searchQuery && ' (filtrelendi)'}
            </div>

            {/* Siparişler Listesi */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Sipariş ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Toplam
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Detay
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAndSortedOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {getOrderSummary(order.items)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {getTotalItemCount(order.items)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">
                          ₺{order.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[order.status]?.text || 'text-gray-700'}`}>
                            {STATUS_COLORS[order.status]?.label || 'Bilinmiyor'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            className="text-primary hover:text-primary-dark"
                          >
                            Detaylar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden">
                {filteredAndSortedOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[order.status]?.text || 'text-gray-700'}`}>
                          {STATUS_COLORS[order.status]?.label || 'Bilinmiyor'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="pb-3 border-b border-gray-100">
                          <p className="text-sm text-gray-500">Ürünler</p>
                          <div className="mt-2 space-y-1">
                            {order.items?.map((item, index) => renderOrderItem(item, index))}
                          </div>
                        </div>

                        <div className="flex justify-between py-2">
                          <div>
                            <p className="text-sm text-gray-500">Toplam</p>
                            <p className="font-bold text-primary mt-0.5">₺{order.totalAmount?.toFixed(2) || '0.00'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Toplam Ürün</p>
                            <p className="font-medium text-gray-900 mt-0.5">
                              {getTotalItemCount(order.items)} adet
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-gray-50 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                        className="text-primary hover:text-primary-dark font-medium text-sm inline-flex items-center"
                      >
                        Detayları Görüntüle
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sipariş bulunamadı durumu */}
            {filteredAndSortedOrders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Filtrelere uygun sipariş bulunamadı.' 
                    : 'Henüz sipariş bulunmuyor.'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSortBy('date-desc');
                    }}
                    className="mt-4 text-primary hover:text-primary-dark font-medium"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}

            {/* Sipariş Durumları Açıklaması */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumları</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(STATUS_COLORS).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                    <span className={`w-3 h-3 rounded-full ${value.bg}`}></span>
                    <div>
                      <p className="font-medium text-gray-900">{value.label}</p>
                      <p className="text-sm text-gray-500">
                        {key === 'pending' && 'Siparişiniz alındı, işleme alınmayı bekliyor'}
                        {key === 'processing' && 'Siparişiniz işleniyor, yakında tamamlanacak'}
                        {key === 'completed' && 'Siparişiniz başarıyla tamamlandı'}
                        {key === 'cancelled' && 'Siparişiniz iptal edildi'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sipariş Bilgilendirmesi */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Önemli Bilgiler</h3>
              <div className="space-y-4 text-gray-600">
                <p>• Siparişleriniz genellikle 24 saat içerisinde işleme alınır ve tamamlanır.</p>
                <p>• İşlem süresi, seçilen hizmet ve yoğunluğa göre değişiklik gösterebilir.</p>
                <p>• Siparişinizin durumunu bu sayfadan takip edebilirsiniz.</p>
                <p>• Herhangi bir sorun olması durumunda destek ekibimizle iletişime geçebilirsiniz.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-lg border border-gray-100 px-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Henüz siparişiniz bulunmuyor</h3>
            <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">Hemen alışverişe başlayın!</p>
            <button
              onClick={() => router.push('/dashboard/products')}
              className="bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-semibold hover:bg-primary-dark transform hover:scale-105 transition-all duration-200"
            >
              Ürünleri İncele
            </button>
          </div>
        )}

        {/* Destek Bölümü */}
        <div className="mt-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl shadow-lg border border-primary/10 p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Yardıma mı ihtiyacınız var?</h3>
          <p className="text-gray-600 text-base sm:text-lg mb-6">
            Siparişlerinizle ilgili herhangi bir sorunuz veya sorununuz mu var? Destek ekibimiz size yardımcı olmak için hazır!
          </p>
          <button
            onClick={() => router.push('/dashboard/support')}
            className="bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-semibold hover:bg-primary-dark transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Destek Talebi Oluştur
          </button>
        </div>
      </main>

      {/* Sipariş Detay Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
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
            
            <div className="space-y-6">
              {/* Üst Bilgiler */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Sipariş ID</p>
                  <p className="font-medium">#{selectedOrder._id.slice(-6).toUpperCase()}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[selectedOrder.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[selectedOrder.status]?.text || 'text-gray-700'}`}>
                  {STATUS_COLORS[selectedOrder.status]?.label || 'Bilinmiyor'}
                </span>
              </div>

              {/* Sipariş Özeti */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Sipariş Özeti</h3>
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{item.product?.name || 'Ürün bulunamadı'}</p>
                          <p className="text-sm text-gray-500">Miktar: {item.quantity}</p>
                          <p className="text-sm text-gray-500">
                            Birim Fiyat: ₺{(item.price || 0).toFixed(2)}
                          </p>
                  </div>
                        <p className="font-medium text-primary">
                          ₺{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
              </div>

                      {item.productData && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {item.product?.subCategory === 'followers' ? (
                    <div>
                              <p className="text-sm text-gray-500 mb-1">Hedef Profil</p>
                              <p className="text-sm font-medium text-gray-900 break-all">
                                {item.productData?.username || '-'}
                              </p>
                    </div>
                  ) : (
                      <div>
                              <p className="text-sm text-gray-500 mb-1">Hedef Gönderiler</p>
                              <div className="space-y-1">
                                {item.productData?.links?.map((link, linkIndex) => (
                                  <div key={linkIndex} className="flex items-start gap-2">
                                    <span className="text-sm text-gray-500 flex-shrink-0">{linkIndex + 1}.</span>
                              <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                      className="text-sm text-primary hover:text-primary-dark break-all"
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

              {/* Fiyat Özeti */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ara Toplam</span>
                    <span>₺{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-200">
                    <span>Toplam</span>
                    <span className="text-lg text-primary">₺{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Sipariş Bilgileri */}
              <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                  <p className="text-gray-500">Sipariş Tarihi</p>
                  <p className="font-medium text-gray-900">
                  {new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}
                </p>
                </div>
                <div>
                  <p className="text-gray-500">Toplam Ürün</p>
                  <p className="font-medium text-gray-900">
                    {getTotalItemCount(selectedOrder.items)} adet
                  </p>
                </div>
              </div>

              {/* Destek Butonu */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Sorun mu var?</p>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    router.push('/dashboard/support');
                  }}
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Destek Talebi Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Mobil için yukarı çık butonu */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-colors md:hidden"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}