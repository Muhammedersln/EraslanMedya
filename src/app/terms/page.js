"use client";
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Kullanım Şartları</h1>
          
          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">1. Hizmet Kullanımı</h2>
              <p className="mb-4">
                Medya Eraslan hizmetlerini kullanarak, bu kullanım şartlarını kabul etmiş olursunuz. 
                Hizmetlerimizi kullanırken tüm yerel, ulusal ve uluslararası yasalara uymakla yükümlüsünüz.
              </p>
              <p>
                Aşağıdaki durumlar kesinlikle yasaktır:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Yasadışı veya zararlı içerik paylaşımı</li>
                <li>Başkalarının haklarını ihlal eden davranışlar</li>
                <li>Sistemin güvenliğini tehdit eden eylemler</li>
                <li>Spam veya istenmeyen içerik paylaşımı</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">2. Hesap Güvenliği</h2>
              <p>
                Hesabınızın güvenliğinden siz sorumlusunuz. Güçlü bir şifre kullanmanız ve hesap bilgilerinizi 
                kimseyle paylaşmamanız önemlidir. Hesabınızla yapılan tüm işlemlerden siz sorumlu tutulursunuz.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">3. Hizmet Değişiklikleri</h2>
              <p>
                Medya Eraslan, sunduğu hizmetleri dilediği zaman değiştirme, askıya alma veya sonlandırma 
                hakkını saklı tutar. Bu değişiklikler öncesinde kullanıcıları bilgilendirmeye özen gösteririz.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">4. Ödeme ve İadeler</h2>
              <p className="mb-4">
                Tüm ödemeler peşin olarak alınır. Hizmet başladıktan sonra iade yapılmaz. Ancak, hizmetin 
                sunulamaması durumunda tam iade yapılır.
              </p>
              <p>
                İade politikamız şu durumlarda geçerlidir:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Hizmetin hiç başlamaması</li>
                <li>Teknik nedenlerle hizmetin sunulamaması</li>
                <li>Hizmet kalitesinin garanti edilen seviyenin altında kalması</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">5. Fikri Mülkiyet</h2>
              <p>
                Medya Eraslan&apos;ın tüm içerikleri, logoları ve hizmet markaları şirketimizin fikri mülkiyetidir. 
                Bu içeriklerin izinsiz kullanımı, kopyalanması veya dağıtılması yasaktır.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">6. Sorumluluk Sınırları</h2>
              <p>
                Medya Eraslan, hizmetlerin kullanımından doğabilecek dolaylı veya dolaysız zararlardan sorumlu 
                tutulamaz. Hizmetlerimizi &quot;olduğu gibi&quot; sunuyoruz ve belirli bir amaca uygunluk garantisi vermiyoruz.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">7. İletişim</h2>
              <p>
                Bu kullanım şartları hakkında sorularınız veya geri bildirimleriniz için bize ulaşın:
              </p>
              <div className="mt-2">
                <p>E-posta: info@medyaeraslan.com</p>
                <p>Telefon: +90 543 930 23 95</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">8. Değişiklikler</h2>
              <p>
                Bu kullanım şartları zaman zaman güncellenebilir. Değişiklikler web sitemizde yayınlandığı 
                tarihten itibaren geçerli olur. Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR')}.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 