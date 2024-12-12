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
    active: true,
    taxRate: '18'
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
  }, [user, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      toast.error('Ürünler yüklenirken bir hata oluştu');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
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
        ? `${API_URL}/admin/products/${editingProduct._id}`
        : `${API_URL}/admin/products`;
        
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
      active: product.active,
      taxRate: product.taxRate
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
      active: true,
      taxRate: '18'
    });
    setEditingProduct(null);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Ürün silinirken bir hata oluştu');
      }

      await fetchProducts(); // Ürün listesini yenile
      toast.success('Ürün başarıyla silindi');
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

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Ürünler</h1>
          <p className="text-text-light">Ürünleri yönetin</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
        >
          Yeni Ürün Ekle
        </button>
        <button
          onClick={updateAllTaxRates}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Tüm KDV Oranlarını Güncelle
        </button>
      </div>

      {/* Ürün Listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Kategori Filtresi */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Alt Kategori Filtresi */}
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">Tüm Alt Kategoriler</option>
            {selectedCategory !== 'all' && 
              categories
                .find(cat => cat.id === selectedCategory)
                ?.subCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))
            }
          </select>

          {/* Arama Kutusu */}
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>

        {products.length > 0 ? (
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Ürün Adı</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Görsel</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Kategori</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Alt Kategori</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Fiyat</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Durum</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 text-sm text-text">{product.name}</td>
                  <td className="px-6 py-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      {product.image && (
                        <Image
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png'; // Yedek görsel
                          }}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text">
                    <span className="inline-flex items-center">
                      {categories.find(cat => cat.id === product.category)?.icon}
                      <span className="ml-2">
                        {categories.find(cat => cat.id === product.category)?.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text">
                    {categories
                      .find(cat => cat.id === product.category)
                      ?.subCategories.find(sub => sub.id === product.subCategory)?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-text">₺{product.price}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.active 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {product.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">
              Henüz ürün bulunmuyor veya ürünler yüklenirken bir hata oluştu.
            </p>
          </div>
        )}
      </div>

      {/* Ürün Ekleme/Düzenleme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
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
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
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
                    {categories
                      .find(cat => cat.id === formData.category)
                      ?.subCategories.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    KDV Oranı (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                    min="0"
                    max="100"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  {editingProduct && (
                    <p className="mt-1 text-xs text-text-light">
                      Yeni bir görsel seçmezseniz mevcut görsel kullanılmaya devam edecektir.
                    </p>
                  )}
                </div>
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

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-text-light hover:text-text transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {editingProduct ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 