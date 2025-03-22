"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/Section/HeroSection";
import ProductsGridSection from "@/components/Section/ProductsGridSection";
import FeaturesSection from "@/components/Section/FeaturesSection";

// Ana sayfa için statik metadata değerleri bu bileşende kullanılmaz
// metadata.js ve layout.js içerisinde tanımlanmıştır

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      {/* Schema.org için article yapısı */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'Eraslan Medya | Sosyal Medya Büyütme Hizmetleri',
            'description': 'Sosyal medya hesaplarınızı büyütmek için güvenilir ve hızlı çözümler sunuyoruz. Instagram ve TikTok takipçi, beğeni ve etkileşim hizmetleri.',
            'publisher': {
              '@type': 'Organization',
              'name': 'Eraslan Medya',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://eraslanmedya.com/logo.png'
              }
            }
          })
        }}
      />
      
      <HeroSection />
      <ProductsGridSection />
      <FeaturesSection />

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
              aria-label="Ücretsiz hesap oluştur"
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
