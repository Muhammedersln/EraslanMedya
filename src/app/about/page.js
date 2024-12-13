import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 -skew-y-6 transform origin-top-left" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Hikayemizi <span className="text-primary">Keşfedin</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Sosyal medya dünyasında güvenilir ve yenilikçi çözümlerle markanızı büyütmeye odaklanıyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              {/* Sol taraf - Görsel */}
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                <Image
                  src="/about-image.jpg"
                  alt="Eraslan Medya Hakkında"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Sağ taraf - İçerik */}
              <div className="space-y-8">
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Eraslan Medya ile <span className="text-primary">Dijital Başarı</span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  2024 yılından bu yana sosyal medya hizmetleri alanında öncü olan Eraslan Medya, 
                  Instagram ve TikTok platformlarında yenilikçi ve güvenilir çözümler sunarak 
                  markaların dijital varlığını güçlendiriyor.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">
                      7/24 canlı destek ile kesintisiz müşteri deneyimi
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">
                      SSL korumalı güvenli ödeme altyapısı
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">
                      %100 memnuniyet garantili hızlı teslimat
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="text-5xl font-bold text-primary mb-4">1000+</div>
                <div className="text-gray-700 font-medium text-lg">Mutlu Müşteri</div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="text-5xl font-bold text-primary mb-4">5000+</div>
                <div className="text-gray-700 font-medium text-lg">Tamamlanan Sipariş</div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="text-5xl font-bold text-primary mb-4">%99</div>
                <div className="text-gray-700 font-medium text-lg">Müşteri Memnuniyeti</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Misyonumuz</h3>
                <p className="text-gray-600 leading-relaxed">
                  Müşterilerimize en kaliteli sosyal medya hizmetlerini sunarak, 
                  dijital varlıklarını güçlendirmek ve hedeflerine ulaşmalarına 
                  yardımcı olmak için çalışıyoruz.
                </p>
              </div>
              
              <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Vizyonumuz</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sosyal medya hizmetleri sektöründe lider konuma ulaşarak, 
                  yenilikçi çözümler ve müşteri odaklı yaklaşımımızla 
                  sektöre yön veren bir marka olmak.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}