"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/Navbar';
import { API_URL } from '@/utils/constants';
import toast from 'react-hot-toast';
import Footer from '@/components/Footer';

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Bekliyor' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'İşleniyor' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Tamamlandı' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'İptal Edildi' }
};

export default function Orders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Siparişler getirilemedi');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <DashboardNavbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />
      
      <main className="container mx-auto px-4 py-8 sm:py-12 mt-16">
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mb-2">Siparişlerim</h1>
          <p className="text-gray-600 text-base sm:text-lg">Tüm siparişlerinizi görüntüleyin ve takip edin</p>
        </div>

        {orders.length > 0 ? (
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
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {order.product.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">
                        ₺{order.totalPrice}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status].bg} ${STATUS_COLORS[order.status].text}`}>
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
              {orders.map((order) => (
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status].bg} ${STATUS_COLORS[order.status].text}`}>
                        {STATUS_COLORS[order.status].label}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="pb-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Ürün</p>
                        <p className="font-medium text-gray-900 mt-0.5">{order.product.name}</p>
                      </div>

                      <div className="flex justify-between py-2">
                        <div>
                          <p className="text-sm text-gray-500">Miktar</p>
                          <p className="font-medium text-gray-900 mt-0.5">{order.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Toplam</p>
                          <p className="font-bold text-primary mt-0.5">₺{order.totalPrice}</p>
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
      </main>

      {/* Responsive Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Sipariş Detayları
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Sipariş ID</p>
                <p className="font-medium">{selectedOrder._id.slice(-6).toUpperCase()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Ürün</p>
                <p className="font-medium">{selectedOrder.product?.name || '-'}</p>
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
                <p className="text-sm text-gray-500">İlerleme</p>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (selectedOrder.currentCount / selectedOrder.targetCount) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{selectedOrder.currentCount}</span>
                    <span>{selectedOrder.targetCount}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Toplam Tutar</p>
                <p className="font-medium">₺{selectedOrder.totalPrice}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Sipariş Tarihi</p>
                <p className="font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}