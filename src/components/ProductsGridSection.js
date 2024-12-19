"use client";
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function ProductsGridSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/featured');
        if (!response.ok) throw new Error('Ürünler yüklenemedi');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const startSlider = () => {
    const interval = setInterval(() => {
      const slider = document.getElementById('product-slider');
      if (slider) {
        const scrollAmount = slider.clientWidth;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const currentScroll = slider.scrollLeft;

        if (currentScroll >= maxScroll - 20) {
          slider.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          slider.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }, 5000);

    intervalRef.current = interval;
  };

  const scrollSlider = (direction) => {
    const slider = document.getElementById('product-slider');
    if (slider) {
      const scrollAmount = slider.clientWidth;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const currentScroll = slider.scrollLeft;

      if (direction === 'left') {
        if (currentScroll <= 0) {
          slider.scrollTo({
            left: maxScroll,
            behavior: 'smooth'
          });
        } else {
          slider.scrollTo({
            left: currentScroll - scrollAmount,
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
          slider.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  useEffect(() => {
    startSlider();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popüler Hizmetlerimiz
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Her kategoriden öne çıkan hizmetlerimizi keşfedin
          </p>
        </div>

        <div className="relative">
          <button 
            onClick={() => scrollSlider('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => scrollSlider('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div 
            id="product-slider"
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth px-2 py-4"
            onMouseEnter={() => {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }}
            onMouseLeave={() => {
              if (!intervalRef.current) {
                startSlider();
              }
            }}
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Tüm Ürünleri Gör</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
} 