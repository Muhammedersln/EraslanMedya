"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { toast } from 'react-hot-toast';
import { API_URL } from '@/utils/constants';

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('instagram');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const categories = [
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-cyan-500 to-blue-500' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'from-red-500 to-rose-500' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const filteredProducts = data.filter(product => 
          product.active && 
          (!activeCategory || product.category === activeCategory)
        );
        
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Ürün çekme hatası:', error);
        toast.error('Ürünler yüklenirken bir hata oluştu');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-white">
        <Navbar />
        <div className="pt-32 pb-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-dark text-transparent bg-clip-text">
            Sosyal Medya Paketleri
          </h1>
          <p className="mt-4 text-text-light max-w-2xl mx-auto">
            En uygun fiyatlarla kaliteli ve güvenilir sosyal medya hizmetleri sunuyoruz.
            Hesabınızı büyütmek için doğru yerdesiniz.
          </p>
        </div>

        {/* Search ve Kategori Seçimi */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          {/* Arama */}
          <div className="relative">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 rounded-full bg-white shadow-sm border border-secondary-light/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-text-light">
              🔍
            </span>
          </div>

          {/* Kategoriler */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300
                  ${activeCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                    : 'bg-white text-text-light hover:bg-primary/5'
                  }
                `}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ürün Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-text mb-2">
              Ürün Bulunamadı
            </h3>
            <p className="text-text-light">
              {searchTerm
                ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                : 'Bu kategoride henüz ürün bulunmuyor.'}
            </p>
          </div>
        )}

        {/* Alt Bilgi */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 p-6 bg-white rounded-2xl shadow-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-sm font-medium text-text">Güvenli Ödeme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm font-medium text-text">Hızlı Teslimat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💬</div>
              <div className="text-sm font-medium text-text">7/24 Destek</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 