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
