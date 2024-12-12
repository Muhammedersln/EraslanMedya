"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { API_URL } from '@/utils/constants';

export default function DashboardProductCard({ product, index, onCartUpdate }) {
  const router = useRouter();
  const { user } = useAuth();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath}`;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: product.minQuantity
        })
      });

      if (!response.ok) {
        throw new Error('Ürün sepete eklenemedi');
      }

      toast.success('Ürün sepete eklendi');
      
      // Sepet sayısını güncelle
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        <Image
          src={getImageUrl(product.image)}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="font-semibold mb-2">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {product.description}
      </p>
      <div className="flex justify-between items-center">
        <span className="font-bold text-primary">₺{product.price}</span>
        <button
          onClick={handleAddToCart}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Sepete Ekle
        </button>
      </div>
    </motion.div>
  );
} 