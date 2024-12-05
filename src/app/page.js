"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Kullanıcı giriş yapmışsa yönlendir
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Sosyal Medya Pazarlama Hizmetleri
            </h1>
            <p className="text-xl text-text-light mb-8">
              Instagram, TikTok ve YouTube için takipçi, beğeni ve etkileşim hizmetlerini güvenilir ve uygun fiyatlarla sunuyoruz.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/login" 
                className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                Giriş Yap
              </Link>
              <Link 
                href="/register" 
                className="bg-primary/10 text-primary px-8 py-3 rounded-xl hover:bg-primary/15 transition-colors font-medium"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hizmetler */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Sunduğumuz Hizmetler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-text mb-3">Instagram</h3>
              <ul className="space-y-2 text-text-light">
                <li>Türk Takipçi</li>
                <li>Beğeni Paketi</li>
                <li>Yorum Hizmeti</li>
                <li>Reels İzlenme</li>
              </ul>
            </div>

            <div className="bg-background rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-text mb-3">TikTok</h3>
              <ul className="space-y-2 text-text-light">
                <li>Global Takipçi</li>
                <li>Video İzlenme</li>
                <li>Beğeni Paketi</li>
                <li>Canlı Yayın</li>
              </ul>
            </div>

            <div className="bg-background rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">▶️</div>
              <h3 className="text-xl font-semibold text-text mb-3">YouTube</h3>
              <ul className="space-y-2 text-text-light">
                <li>Abone Artışı</li>
                <li>Video İzlenme</li>
                <li>Video Beğeni</li>
                <li>Yorum Paketi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Neden Biz */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Neden Bizi Tercih Etmelisiniz?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡️</span>
              </div>
              <h3 className="font-semibold text-text mb-2">Hızlı Teslimat</h3>
              <p className="text-text-light text-sm">Siparişleriniz anında işleme alınır</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-text mb-2">Güvenli Ödeme</h3>
              <p className="text-text-light text-sm">SSL korumalı ödeme sistemi</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-text mb-2">7/24 Destek</h3>
              <p className="text-text-light text-sm">Her zaman yanınızdayız</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="font-semibold text-text mb-2">Kaliteli Hizmet</h3>
              <p className="text-text-light text-sm">%100 memnuniyet garantisi</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-text-light mb-8 max-w-2xl mx-auto">
            Sosyal medya hesaplarınızı büyütmek için hemen üye olun ve hizmetlerimizden faydalanın.
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium"
          >
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}
