import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import heroImage from "../../../public/images/herosection.png"; //değişecek
import Link from 'next/link';


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
                Biz <span className="text-primary">Kimiz?</span>
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
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={heroImage}
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
                  Eraslan Medya ile <span className="text-primary">Fark Yaratın</span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  2017 yılından bu yana sosyal medya hizmetleri alanında öncü olan Eraslan Medya, 
                  Instagram ve TikTok platformlarında yenilikçi ve güvenilir çözümler sunarak 
                  markaların dijital varlığını güçlendiriyor.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-4xl font-bold text-primary mb-2">7/24</div>
                    <p className="text-gray-700">Kesintisiz Destek</p>
                  </div>
                  
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-4xl font-bold text-primary mb-2">%100</div>
                    <p className="text-gray-700">Müşteri Memnuniyeti</p>
                  </div>
                  
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                    <p className="text-gray-700">Mutlu Müşteri</p>
                  </div>
                  
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                    <p className="text-gray-700">Başarılı Proje</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary-dark">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              Sosyal Medya Yolculuğunuza Bizimle Başlayın
            </h2>
            <Link href="/register" className="bg-white text-primary px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-medium">
              Hemen Başla
            </Link> 
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}