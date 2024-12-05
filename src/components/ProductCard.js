"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { API_URL } from '@/utils/constants';

export default function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(product.minQuantity);
  const [isHovered, setIsHovered] = useState(false);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= product.minQuantity && value <= product.maxQuantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    toast.success('Ürün sepete eklendi!');
  };

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Görsel ve Fiyat */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        <Image
          src={`${API_URL}${product.image}`}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Fiyat */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="font-bold text-primary">₺{product.price}</span>
        </div>

        {/* Kategori */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary/90 text-white px-2.5 py-1 rounded-full text-xs uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>

      {/* İçerik */}
      <div className="p-4">
        {/* Başlık ve Açıklama */}
        <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-text-light line-clamp-2">
          {product.description}
        </p>

        {/* Miktar ve Sepete Ekle */}
        <div className="mt-4 flex items-center justify-between gap-3">
          {/* Miktar Seçici */}
          <div className="flex items-center bg-background rounded-lg">
            <button 
              onClick={() => quantity > product.minQuantity && setQuantity(q => q - 1)}
              className="w-8 h-8 flex items-center justify-center text-text-light hover:text-primary transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min={product.minQuantity}
              max={product.maxQuantity}
              className="w-12 h-8 text-center bg-transparent border-none focus:outline-none text-sm"
            />
            <button 
              onClick={() => quantity < product.maxQuantity && setQuantity(q => q + 1)}
              className="w-8 h-8 flex items-center justify-center text-text-light hover:text-primary transition-colors"
            >
              +
            </button>
          </div>

          {/* Sepete Ekle Butonu */}
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white h-8 rounded-lg hover:bg-primary-dark transform hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium"
          >
            Sepete Ekle · ₺{(product.price * quantity).toFixed(2)}
          </button>
        </div>

        {/* Min-Max Bilgisi */}
        <div className="mt-2 text-xs text-text-light/70 text-center">
          Min: {product.minQuantity} · Max: {product.maxQuantity}
        </div>
      </div>
    </div>
  );
} 