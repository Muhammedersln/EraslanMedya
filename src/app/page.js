"use client";
import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_URL } from '@/utils/constants';
import ProductCard from "@/components/ProductCard";
import heroImage from "../../public/images/herosection.png";


export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [sliderInterval, setSliderInterval] = useState(null);

  // Slider'ı başlatma fonksiyonu
  const startSlider = () => {
    const interval = setInterval(() => {
      const slider = document.getElementById('product-slider');
      if (slider) {
        const scrollAmount = slider.clientWidth;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const currentScroll = slider.scrollLeft;

        // Eğer sona yaklaşıyorsa başa dön
        if (currentScroll >= maxScroll - 20) {
          slider.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Bir sonraki karta kaydır
          slider.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }, 5000);

    setSliderInterval(interval);
  };

  // Slider'ı manuel kaydırma fonksiyonu
  const scrollSlider = (direction) => {
    const slider = document.getElementById('product-slider');
    if (slider) {
      const scrollAmount = slider.clientWidth;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const currentScroll = slider.scrollLeft;

      if (direction === 'left') {
        // Sola kaydırma - başa gelince sona git
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
        // Sağa kaydırma - sona gelince başa git
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
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }

    // Ürünleri çek
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error('Ürünler yüklenemedi');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      }
    };

    fetchProducts();
    startSlider(); // Slider'ı başlat

    // Cleanup function
    return () => {
      if (sliderInterval) {
        clearInterval(sliderInterval);
      }
    };
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-24 sm:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Sosyal Medya Hesabınızı <br className="hidden sm:block" />
                <span className="text-primary">Büyütün</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Instagram ve TikTok için güvenilir, hızlı ve uygun fiyatlı takipçi, beğeni ve etkileşim hizmetleri.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl transition-all duration-300 font-medium text-base shadow-lg hover:shadow-primary/25"
                >
                  Hemen Başla
                </Link>
                <Link 
                  href="/products" 
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-primary border-2 border-primary hover:border-primary-dark px-8 py-4 rounded-xl hover:bg-primary/5 transition-all duration-300 font-medium text-base"
                >
                  Ürünleri İncele
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0">
              <div className="relative w-full max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl transform rotate-6"></div>
                <Image
                  src={heroImage}
                  alt="Social Media Growth"
                  width={600}
                  height={500}
                  className="relative rounded-2xl shadow-xl w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popüler Hizmetlerimiz
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En çok tercih edilen sosyal medya hizmetlerimizi keşfedin
            </p>
          </div>

          <div className="relative">
            {/* Navigation Buttons */}
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

            {/* Slider Container */}
            <div 
              id="product-slider"
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth px-2 py-4"
              onMouseEnter={() => {
                if (sliderInterval) {
                  clearInterval(sliderInterval);
                  setSliderInterval(null);
                }
              }}
              onMouseLeave={() => {
                if (!sliderInterval) {
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
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Neden Bizi Tercih Etmelisiniz?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Yüksek kaliteli hizmetlerimiz ve müşteri memnuniyeti odaklı yaklaşımımızla fark yaratıyoruz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Hızlı Teslimat</h3>
              <p className="text-gray-600">
                Siparişleriniz otomatik sistemimiz sayesinde anında işleme alınır ve hızlıca teslim edilir.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Güvenli Ödeme</h3>
              <p className="text-gray-600">
                SSL sertifikalı güvenli ödeme altyapımız ile ödemelerinizi güvenle yapabilirsiniz.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7/24 Destek</h3>
              <p className="text-gray-600">
                Teknik destek ekibimiz sorularınızı yanıtlamak için her zaman hazır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Hesabınızı Büyütmeye Hazır mısınız?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Hemen üye olun ve sosyal medya hesaplarınızı büyütmeye başlayın.
            </p>
            <Link 
              href="/register" 
              className="inline-block bg-white text-primary px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-medium"
            >
              Ücretsiz Hesap Oluştur
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
