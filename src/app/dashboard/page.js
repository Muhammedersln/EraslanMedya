"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/components/DashboardNavbar";

const featuredProducts = [
  {
    id: 1,
    name: "Instagram Takipçi",
    description: "Gerçek ve kalıcı Instagram takipçileri",
    price: 29.99,
    image: "👥"
  },
  {
    id: 2,
    name: "Instagram Beğeni",
    description: "Hızlı ve kaliteli Instagram beğenileri",
    price: 19.99,
    image: "❤️"
  },
  {
    id: 3,
    name: "TikTok İzlenme",
    description: "Organik TikTok video izlenmeleri",
    price: 24.99,
    image: "👁️"
  },
  {
    id: 4,
    name: "YouTube Abone",
    description: "Kaliteli YouTube aboneleri",
    price: 39.99,
    image: "📺"
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="bg-primary/5 rounded-2xl p-8 mb-12">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Hoş Geldiniz, {user.firstName}!
          </h1>
          <p className="text-text-light max-w-2xl mb-6">
            Sosyal medya hesaplarınızı büyütmek için en kaliteli hizmetleri sunuyoruz. 
            Hemen alışverişe başlayın ve hesaplarınızı büyütün.
          </p>
          <button 
            onClick={() => router.push('/dashboard/products')}
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
          >
            Tüm Ürünleri Gör
          </button>
        </div>

        {/* Öne Çıkan Ürünler */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-text mb-6">Öne Çıkan Ürünler</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{product.image}</div>
                <h3 className="text-lg font-medium text-text mb-2">{product.name}</h3>
                <p className="text-text-light text-sm mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">₺{product.price}</span>
                  <button className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/15 transition-colors">
                    Sepete Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Son Siparişler */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-text">Son Siparişleriniz</h2>
            <button 
              onClick={() => router.push('/dashboard/orders')}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              Tüm Siparişler
            </button>
          </div>
          
          <div className="text-center py-8 text-text-light">
            Henüz sipariş bulunmuyor.
          </div>
        </div>
      </main>
    </div>
  );
} 