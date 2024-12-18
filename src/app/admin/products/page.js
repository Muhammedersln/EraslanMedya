"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FaInstagram, FaTiktok, FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

export default function AdminProducts() {
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ürünler yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
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
        ? `/api/admin/products/${editingProduct._id}`
        : '/api/admin/products';
        
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
            toast.error(`${error.field}: ${error.message}`);
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        e.target.value = '';
        return;
      }

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
      description: product.description || '',
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
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ürün silinirken bir hata oluştu');
      }

      toast.success('Ürün başarıyla silindi');
      fetchProducts();
    } catch (error) {
      console.error('Ürün silinirken hata:', error);
      toast.error(error.message || 'Ürün silinirken bir hata oluştu');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    return imagePath.startsWith('http') ? imagePath : `/uploads/${imagePath}`;
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;

    const matchesSubCategory = selectedSubCategory === 'all' || 
      product.subCategory === selectedSubCategory;

    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto">
      {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
              <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
              <p className="text-gray-500 mt-1">Toplam {filteredProducts.length} ürün</p>
        </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
              <FaPlus className="text-sm" />
              <span>Yeni Ürün Ekle</span>
          </button>
      </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative col-span-1 sm:col-span-2">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                          </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
                        </div>
            <div>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
              >
                <option value="all">Tüm Alt Kategoriler</option>
                {selectedCategory !== 'all' && categories
                  .find(cat => cat.id === selectedCategory)
                  ?.subCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
              </select>
          </div>
        </div>
      </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
            <div 
              key={product._id} 
              className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                  <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 bg-white/90 hover:bg-white text-primary rounded-full transition-colors duration-200"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full transition-colors duration-200"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    product.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                </div>

              <div className="p-5">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                  {product.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  )}
            </div>
            
                <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                    <p className="text-gray-500 mb-1">Kategori</p>
                    <div className="flex items-center text-gray-900">
                      {product.category === 'instagram' ? <FaInstagram className="mr-2" /> : <FaTiktok className="mr-2" />}
                      <span className="capitalize">{product.subCategory}</span>
                </div>
              </div>
              <div>
                    <p className="text-gray-500 mb-1">Fiyat</p>
                    <p className="font-medium text-gray-900">
                  ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                    <p className="text-gray-500 mb-1">Min. Miktar</p>
                    <p className="text-gray-900">{product.minQuantity}</p>
              </div>
              <div>
                    <p className="text-gray-500 mb-1">Max. Miktar</p>
                    <p className="text-gray-900">{product.maxQuantity}</p>
                  </div>
                </div>
            </div>
          </div>
        ))}
      </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-gray-500">
              {searchQuery || selectedCategory !== 'all' ? 
                'Arama kriterlerinize uygun ürün bulunamadı.' : 
                'Henüz hiç ürün eklenmemiş.'
              }
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
              {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alt Kategori</label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                    required
                  >
                    {categories
                      .find(cat => cat.id === formData.category)
                      ?.subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min. Miktar</label>
                  <input
                    type="number"
                    name="minQuantity"
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    min="1"
                    required
                  />
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max. Miktar</label>
                  <input
                    type="number"
                    name="maxQuantity"
                    value={formData.maxQuantity}
                    onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    min="1"
                    required
                  />
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Görseli</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    required={!editingProduct}
                  />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label className="ml-2 text-sm text-gray-900">
                  Ürün Aktif
                </label>
              </div>

                <div className="sticky bottom-0 flex justify-end gap-3 pt-6 border-t border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-500 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : (editingProduct ? 'Güncelle' : 'Ekle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 