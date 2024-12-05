"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';
import Image from 'next/image';
import { API_URL } from '@/utils/constants';

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
    minQuantity: '1',
    maxQuantity: '',
    imageFile: null,
    active: true
  });

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
      // Form verilerini kontrol et
      console.log('Form verileri:', formData);

      // Tüm alanların dolu olduğunu kontrol et
      const requiredFields = ['name', 'description', 'price', 'minQuantity', 'maxQuantity'];
      const emptyFields = requiredFields.filter(field => !formData[field]);
      
      if (emptyFields.length > 0) {
        console.log('Boş alanlar:', emptyFields);
        throw new Error(`Şu alanlar boş bırakılamaz: ${emptyFields.join(', ')}`);
      }

      if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        throw new Error('Geçerli bir fiyat giriniz');
      }

      if (Number(formData.maxQuantity) < Number(formData.minQuantity)) {
        throw new Error('Maksimum miktar, minimum miktardan küçük olamaz');
      }

      // Yeni ürün eklerken görsel zorunlu
      if (!editingProduct && !formData.imageFile) {
        throw new Error('Lütfen bir ürün görseli seçin');
      }

      const url = editingProduct 
        ? `${API_URL}/admin/products/${editingProduct._id}`
        : `${API_URL}/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      // Form verilerini FormData nesnesine dönüştür
      const formDataToSend = new FormData();

      // Görsel dosyasını ekle
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      // Diğer alanları ekle ve string'e dönüştür
      formDataToSend.append('name', String(formData.name).trim());
      formDataToSend.append('description', String(formData.description).trim());
      formDataToSend.append('price', String(Number(formData.price)));
      formDataToSend.append('category', String(formData.category));
      formDataToSend.append('minQuantity', String(Number(formData.minQuantity)));
      formDataToSend.append('maxQuantity', String(Number(formData.maxQuantity)));
      formDataToSend.append('active', String(formData.active));

      // FormData içeriğini kontrol et
      console.log('FormData içeriği:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const responseData = await response.json();
      console.log('Sunucu yanıtı:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Bir hata oluştu');
      }

      await fetchProducts();
      setShowModal(false);
      resetForm();
      toast.success(editingProduct ? 'Ürün güncellendi!' : 'Ürün eklendi!');
      
    } catch (error) {
      console.error('Ürün kaydedilirken hata:', error);
      toast.error(error.message || 'Ürün kaydedilirken bir hata oluştu');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      minQuantity: product.minQuantity.toString(),
      maxQuantity: product.maxQuantity.toString(),
      imageFile: null,
      active: product.active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'instagram',
      minQuantity: '1',
      maxQuantity: '',
      imageFile: null,
      active: true
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
      </div>

      {/* Ürün Listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {products.length > 0 ? (
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Ürün Adı</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Görsel</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Kategori</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Fiyat</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Durum</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 text-sm text-text">{product.name}</td>
                  <td className="px-6 py-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={`${API_URL}${product.image}`}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text capitalize">{product.category}</td>
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
                    Kategori
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-light rounded-lg"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                {editingProduct && (
                  <p className="mt-1 text-xs text-text-light">
                    Yeni bir görsel seçmezseniz mevcut görsel kullanılmaya devam edecektir.
                  </p>
                )}
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