"use client";
import Image from "next/image";
import Link from "next/link";
import heroImage from "../../public/images/herosection.png";

export default function HeroSection() {
  return (
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
  );
} 