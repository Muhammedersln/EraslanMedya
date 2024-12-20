"use client";
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { motion } from 'framer-motion';

export default function ProductsGridSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [startDragTime, setStartDragTime] = useState(0);

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
      if (sliderRef.current) {
        const scrollAmount = sliderRef.current.children[0]?.offsetWidth || 0;
        const maxScroll = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
        const currentScroll = sliderRef.current.scrollLeft;

        if (currentScroll >= maxScroll - 20) {
          sliderRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          sliderRef.current.scrollBy({
            left: scrollAmount + 16,
            behavior: 'smooth'
          });
        }
      }
    }, 4000);

    intervalRef.current = interval;
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.children[0]?.offsetWidth || 0;
      const maxScroll = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
      const currentScroll = sliderRef.current.scrollLeft;

      if (direction === 'left') {
        if (currentScroll <= 0) {
          sliderRef.current.scrollTo({
            left: maxScroll,
            behavior: 'smooth'
          });
        } else {
          sliderRef.current.scrollBy({
            left: -(scrollAmount + 16),
            behavior: 'smooth'
          });
        }
      } else {
        if (currentScroll >= maxScroll - 20) {
          sliderRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          sliderRef.current.scrollBy({
            left: scrollAmount + 16,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  useEffect(() => {
    const currentInterval = intervalRef.current;
    return () => {
      if (currentInterval) {
        clearInterval(currentInterval);
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    setStartDragTime(Date.now());
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll hızı çarpanı
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = (e) => {
    const dragTime = Date.now() - startDragTime;
    const dragDistance = Math.abs(e.pageX - (startX + sliderRef.current.offsetLeft));

    // Eğer sürükleme süresi kısa ve mesafe azsa, bunu tıklama olarak kabul et
    if (dragTime < 200 && dragDistance < 10) {
      setIsDragging(false);
      return; // Normal tıklama eventi devam etsin
    }

    setIsDragging(false);
    document.body.style.userSelect = 'text';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = 'text';
    }
    // Mevcut mouseLeave fonksiyonunu da çalıştır
    if (!intervalRef.current) {
      startSlider();
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
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
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 ">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-dark to-primary">
            Popüler Hizmetlerimiz
          </h2>
          <p className="text-gray-600 text-lg">
            En çok tercih edilen hizmetlerimiz
          </p>
        </motion.div>

        <div className="relative">
          <div
            ref={sliderRef}
            className={`flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: isDragging ? 'auto' : 'smooth'
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-[300px] flex-none"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Sol Ok */}
          <button
            onClick={() => scrollSlider('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-r-xl bg-white/90 shadow-lg hover:bg-primary hover:text-white transition-all duration-300 opacity-100 md:opacity-0 md:hover:opacity-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Sağ Ok */}
          <button
            onClick={() => scrollSlider('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-l-xl bg-white/90 shadow-lg hover:bg-primary hover:text-white transition-all duration-300 opacity-100 md:opacity-0 md:hover:opacity-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <motion.div
          className="text-center mt-12 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/dashboard/products"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark overflow-hidden px-8 py-4 rounded-xl"
            >
              <span className="relative z-10 text-lg font-medium text-white transition-transform duration-300 group-hover:translate-x-[-4px]">
                Tüm Ürünleri Keşfet
              </span>
              <motion.span
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-[4px]"
                initial={{ x: 0 }}
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 