"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';
import Image from 'next/image';
import { API_URL } from '@/utils/constants';
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function AdminProducts() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'instagram',
    subCategory: 'followers',
    minQuantity: '1',
    maxQuantity: '',
    imageFile: null,
    active: true
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    taxRate: 0.18
  });
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [newTaxRate, setNewTaxRate] = useState('');

  const categories = [
    { 
      id: 'instagram', 
      name: 'Instagram',
      icon: <FaInstagram />,
      subCategories: [
        { id: 'followers', name: 'Takipçi' },
        { id: 'likes', name: 'Beğeni' },
        { id: 'views', name: 'İzlenme' },
        { id: 'comments', name: 'Yorum' }
      ]
    },
    { 
      id: 'tiktok', 
      name: 'TikTok',
      icon: <FaTiktok />,
      subCategories: [
        { id: 'followers', name: 'Takipçi' },
        { id: 'likes', name: 'Beğeni' },
        { id: 'views', name: 'İzlenme' },
        { id: 'comments', name: 'Yorum' }
      ]
    }
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchProducts();
    fetchSettings();
  }, [user, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ürünler yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error.message);
      // Toast veya notification gösterilebilir
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ayarlar yüklenemedi');
      }
      
      const data = await response.json();
      
      setSettings({
        taxRate: data.taxRate,
        updatedAt: data.updatedAt
      });

    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
      setSettings({ taxRate: 0.18 });
      toast.error('Ayarlar yüklenirken bir hata oluştu, varsayılan değerler kullanılıyor');
    }
  };

  const updateTaxRate = async () => {
    try {
      const taxRate = parseFloat(newTaxRate) / 100;
      
      if (isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
        toast.error('Geçerli bir KDV oranı giriniz (0-100 arası)');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/settings/tax-rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taxRate })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'KDV oranı güncellenemedi');
      }

      const data = await response.json();
      setSettings(prev => ({ ...prev, taxRate }));
      setShowTaxModal(false);
      setNewTaxRate('');
      toast.success('KDV oranı güncellendi');
      
      // Ürünleri yeniden yükle
      fetchProducts();
    } catch (error) {
      console.error('KDV güncelleme hatası:', error);
      toast.error(error.message || 'KDV oranı güncellenirken bir hata oluştu');
    }
  };

  const handleSubmit = async (e) => {
    setSubmitting(true);
    try {
      e.preventDefault();
      
      if (!formData.name?.trim()) {
        toast.error('Ürün adı zorunludur');
        return;
      }

      if (!formData.price || Number(formData.price) <= 0) {
        toast.error('Geçerli bir fiyat giriniz');
        return;
      }

      if (!formData.category) {
        toast.error('Kategori seçimi zorunludur');
        return;
      }

      if (!formData.subCategory) {
        toast.error('Alt kategori seçimi zorunludur');
        return;
      }

      if (!formData.minQuantity || Number(formData.minQuantity) < 1) {
        toast.error('Minimum miktar 1\'den küçük olamaz');
        return;
      }

      if (!formData.maxQuantity || Number(formData.maxQuantity) <= Number(formData.minQuantity)) {
        toast.error('Maksimum miktar minimum miktardan büyük olmalıdır');
        return;
      }

      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description?.trim() || '');
      formDataToSend.append('price', String(Number(formData.price)));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subCategory', formData.subCategory);
      formDataToSend.append('minQuantity', String(Number(formData.minQuantity)));
      formDataToSend.append('maxQuantity', String(Number(formData.maxQuantity)));
      formDataToSend.append('active', String(formData.active));

      if (!editingProduct && !formData.imageFile) {
        toast.error('Lütfen bir ürün görseli seçin');
        return;
      }
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      const url = editingProduct 
        ? `${API_URL}/api/admin/products/${editingProduct._id}`
        : `${API_URL}/api/admin/products`;
        
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.errors) {
          responseData.errors.forEach(error => {
            toast.error(`${error.message}`);
          });
          return;
        }
        throw new Error(responseData.message || 'Bir hata oluştu');
      }

      toast.success(editingProduct ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!');
      setShowModal(false);
      resetForm();
      fetchProducts();

    } catch (error) {
      console.error('Ürün işlemi hatası:', error);
      toast.error(error.message || 'İşlem sırasında bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.id === value);
      const defaultSubCategory = selectedCategory?.subCategories[0]?.id || 'followers';
      
      setFormData(prev => ({
        ...prev,
        category: value,
        subCategory: defaultSubCategory
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (örn: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        e.target.value = '';
        return;
      }

      // Dosya tipi kontrolü
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Sadece JPEG, PNG ve WEBP formatlar desteklenmektedir');
        e.target.value = '';
        return;
      }

      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      subCategory: product.subCategory,
      minQuantity: product.minQuantity.toString(),
      maxQuantity: product.maxQuantity.toString(),
      imageFile: null,
      active: product.active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    const defaultCategory = 'instagram';
    const defaultSubCategory = categories.find(cat => cat.id === defaultCategory)?.subCategories[0]?.id || 'followers';
    
    setFormData({
      name: '',
      description: '',
      price: '',
      category: defaultCategory,
      subCategory: defaultSubCategory,
      minQuantity: '1',
      maxQuantity: '',
      imageFile: null,
      active: true
    });
    setEditingProduct(null);
  };

  const handleDelete = async (productId) => {
    // Silme işlemi öncesi onay al
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ürün silinirken bir hata oluştu');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        fetchProducts(); // Ürün listesini yenile
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Ürün silinirken hata:', error);
      toast.error(error.message || 'Ürün silinirken bir hata oluştu');
    }
  };

  // Görsel URL'sini oluşturan yardımcı fonksiyon
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Eğer tam URL ise direkt döndür
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Değilse API_URL ile birleştir
    return `${API_URL}/uploads/${imagePath}`;
  };

  const filteredProducts = products.filter(product => {
    // Kategori filtreleme
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;

    // Alt kategori filtreleme
    const matchesSubCategory = selectedSubCategory === 'all' || 
      product.subCategory === selectedSubCategory;

    // Arama filtreleme
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  const updateAllTaxRates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/update-tax`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ taxRate: 10 }) // yeni KDV oranı
      });

      if (!response.ok) {
        throw new Error('KDV oranları güncellenemedi');
      }

      toast.success('Tüm ürünlerin KDV oranları güncellendi');
      fetchProducts(); // ürünleri yeniden yükle
    } catch (error) {
      console.error('KDV güncelleme hatası:', error);
      toast.error('KDV oranları güncellenirken bir hata oluştu');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Ürün adı zorunludur';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Geçerli bir fiyat giriniz';
    // ...
    return errors;
  };

  // Ürün tablosunda fiyat gösterimi için yardımcı fonksiyon
  const formatPrice = (price, withTax = false) => {
    const value = withTax ? price * (1 + settings.taxRate) : price;
    return `₺${value.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Ürünler</h1>
          <p className="text-text-light">Ürünleri yönetin</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => setShowTaxModal(true)}
            className="w-full sm:w-auto bg-secondary text-white px-4 py-2 rounded-xl hover:bg-secondary-dark transition-colors text-sm"
          >
            KDV Oranını Düzenle ({(settings.taxRate * 100).toFixed(0)}%)
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors text-sm"
          >
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* Masaüstü Tasarım */}
      <div className="hidden sm:block">
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-secondary/10">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat (KDV'siz)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat (KDV'li)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                            <Image
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center">
                        {product.category === 'instagram' ? <FaInstagram className="mr-2" /> : <FaTiktok className="mr-2" />}
                        {product.subCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">{formatPrice(product.price, true)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.active 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {product.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-primary hover:text-primary-dark"
                        >
                          Düzenle
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobil Tasarım */}
      <div className="sm:hidden space-y-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                product.active 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-red-50 text-red-600'
              }`}>
                {product.active ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Kategori:</span>
                <span className="inline-flex items-center">
                  {product.category === 'instagram' ? <FaInstagram className="mr-1" /> : <FaTiktok className="mr-1" />}
                  {product.subCategory}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">KDV'siz Fiyat:</span>
                <span>{formatPrice(product.price)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">KDV'li Fiyat:</span>
                <span>{formatPrice(product.price, true)}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => handleEdit(product)}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                Düzenle
              </button>
              <button 
                onClick={() => handleDelete(product._id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* KDV Oranı Modal */}
      {showTaxModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">KDV Oranını Güncelle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KDV Oranı (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newTaxRate}
                    onChange={(e) => setNewTaxRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Örn: 18"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Örnek: 18 için KDV oranı %18 olacaktır
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowTaxModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
                >
                  İptal
                </button>
                <button
                  onClick={updateTaxRate}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors order-1 sm:order-2"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Ekleme/Düzenleme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Fiyat (₺)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Kategori
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Alt Kategori
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                    required
                  >
                    {categories.find(cat => cat.id === formData.category)?.subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Min. Miktar
                  </label>
                  <input
                    type="number"
                    name="minQuantity"
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                    min="1"
                    required
                  />
              </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Max. Miktar
                  </label>
                  <input
                    type="number"
                    name="maxQuantity"
                    value={formData.maxQuantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                    min="1"
                    required
                  />
                </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Ürün Görseli
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                    required={!editingProduct}
                  />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary border-secondary-light rounded"
                />
                <label className="ml-2 text-sm text-text-light">
                  Ürün Aktif
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-text-light hover:text-text transition-colors order-2 sm:order-1"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 order-1 sm:order-2"
                >
                  {submitting ? 'Kaydediliyor...' : (editingProduct ? 'Güncelle' : 'Ekle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 