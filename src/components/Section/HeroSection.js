"use client";
import Image from "next/image";
import Link from "next/link";
import heroImage from "../../../public/images/herosection.png";

export default function HeroSection() {
  return (
    <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-16 sm:pb-20 md:pb-24 lg:pb-32 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'speakable': {
              '@type': 'SpeakableSpecification',
              'cssSelector': ['h1', '.hero-description']
            },
            'mainContentOfPage': {
              '@type': 'WebPageElement',
              'cssSelector': '.hero-section'
            }
          })
        }}
      />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 lg:gap-16 hero-section">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Sosyal Medya Hesabınızı{" "}
              <span className="block mt-1 sm:mt-2 text-primary">Büyütün</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed hero-description">
              Instagram ve TikTok için güvenilir, hızlı ve uygun fiyatlı takipçi, beğeni ve etkileşim hizmetleri.
            </p>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link 
                href="/register" 
                className="w-full xs:w-auto inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl hover:shadow-primary/25"
                aria-label="Hemen hesap oluştur ve başla"
              >
                Hemen Başla
              </Link>
              <Link 
                href="/dashboard/products" 
                className="w-full xs:w-auto inline-flex items-center justify-center bg-white text-primary border-2 border-primary hover:border-primary-dark px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-primary/5 transition-all duration-300 font-medium text-sm sm:text-base"
                aria-label="Tüm ürünleri incele"
              >
                Ürünleri İncele
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0">
            <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl transform rotate-6"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={heroImage}
                  alt="Sosyal Medya Hesap Büyütme - Instagram ve TikTok için takipçi ve etkileşim hizmetleri"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 50vw"
                  loading="eager"
                  fetchPriority="high"
                  quality={90}
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:left-6 bg-white rounded-xl shadow-lg p-3 sm:p-4 animate-float">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Hızlı Teslimat</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">7/24 Destek</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 sm:-top-4 right-4 sm:right-6 bg-white rounded-xl shadow-lg p-3 sm:p-4 animate-float-delayed">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Güvenli Ödeme</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">%100 Güvenli</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </section>
  );
} 