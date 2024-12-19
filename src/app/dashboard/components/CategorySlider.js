"use client";
import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { motion } from "framer-motion";

const categories = [
  {
    id: 'instagram',
    name: 'Instagram', 
    icon: <FaInstagram className="text-2xl" />,
    color: 'from-pink-500 to-purple-500',
    gradient: 'bg-gradient-to-r from-pink-500 to-purple-500'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: <FaTiktok className="text-2xl" />,
    color: 'from-[#00f2ea] to-[#ff0050]',
    gradient: 'bg-gradient-to-r from-[#00f2ea] to-[#ff0050]'
  }
];

export default function CategorySlider({ products, loading, onCartUpdate }) {
  const sliderRefs = useRef({});
  const intervalRefs = useRef({});

  const startSlider = (categoryId) => {
    const interval = setInterval(() => {
      const slider = sliderRefs.current[categoryId];
      if (slider) {
        const scrollAmount = slider.children[0]?.offsetWidth || 0;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const currentScroll = slider.scrollLeft;

        if (currentScroll >= maxScroll - 20) {
          slider.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          slider.scrollBy({
            left: scrollAmount + 16, // 16px is the gap between items
            behavior: 'smooth'
          });
        }
      }
    }, 4000);

    intervalRefs.current[categoryId] = interval;
  };

  const scrollSlider = (categoryId, direction) => {
    const slider = sliderRefs.current[categoryId];
    if (slider) {
      const scrollAmount = slider.children[0]?.offsetWidth || 0;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const currentScroll = slider.scrollLeft;

      if (direction === 'left') {
        if (currentScroll <= 0) {
          slider.scrollTo({
            left: maxScroll,
            behavior: 'smooth'
          });
        } else {
          slider.scrollBy({
            left: -(scrollAmount + 16),
            behavior: 'smooth'
          });
        }
      } else {
        if (currentScroll >= maxScroll - 20) {
          slider.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          slider.scrollBy({
            left: scrollAmount + 16,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  const stopSlider = (categoryId) => {
    if (intervalRefs.current[categoryId]) {
      clearInterval(intervalRefs.current[categoryId]);
      delete intervalRefs.current[categoryId];
    }
  };

  useEffect(() => {
    const currentIntervals = intervalRefs.current;
    return () => {
      Object.values(currentIntervals).forEach(clearInterval);
    };
  }, []);

  const groupProductsByCategory = (products) => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
  };

  const groupedProducts = groupProductsByCategory(products);

  return (
    <div className="space-y-12 py-8">
      {categories.map((category) => {
        const categoryProducts = groupedProducts[category.id] || [];
        
        if (categoryProducts.length === 0 && !loading) return null;
        
        return (
          <section key={category.id} className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className={`${category.gradient} rounded-2xl p-6 shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {category.name} Hizmetleri
                      </h2>
                      <p className="text-white/80 text-sm mt-1">
                        En popüler {category.name} paketlerimiz
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollSlider(category.id, 'left')}
                      className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => scrollSlider(category.id, 'right')}
                      className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <div 
              ref={el => {
                sliderRefs.current[category.id] = el;
                if (el && !intervalRefs.current[category.id]) {
                  startSlider(category.id);
                }
              }}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
              onMouseEnter={() => stopSlider(category.id)}
              onMouseLeave={() => startSlider(category.id)}
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {loading ? (
                [...Array(4)].map((_, index) => (
                  <div 
                    key={index}
                    className="w-[300px] flex-none"
                  >
                    <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                      <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-7 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                categoryProducts.map((product, index) => (
                  <motion.div 
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-[300px] flex-none"
                  >
                    <ProductCard 
                      product={product}
                      index={index}
                      onCartUpdate={onCartUpdate}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}