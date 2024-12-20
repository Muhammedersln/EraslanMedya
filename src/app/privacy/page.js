"use client";
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Gizlilik Politikası</h1>
          
          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">1. Bilgi Toplama ve Kullanımı</h2>
              <p className="mb-4">
                Medya Eraslan olarak, hizmetlerimizi kullanırken sizden bazı kişisel bilgiler talep edebiliriz. 
                Bu bilgiler, size daha iyi hizmet sunmamıza ve deneyiminizi kişiselleştirmemize yardımcı olur.
              </p>
              <p>
                Topladığımız bilgiler şunları içerebilir:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>İsim ve iletişim bilgileri</li>
                <li>Sosyal medya hesap bilgileri</li>
                <li>Ödeme bilgileri</li>
                <li>Kullanım istatistikleri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">2. Bilgi Güvenliği</h2>
              <p>
                Kişisel verilerinizin güvenliği bizim için önemlidir. Bilgilerinizi korumak için endüstri standardı 
                güvenlik önlemleri kullanıyoruz. Verileriniz şifreleme teknolojileri ile korunmakta ve düzenli 
                olarak güvenlik değerlendirmeleri yapılmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">3. Çerezler ve İzleme</h2>
              <p>
                Web sitemizde çerezler ve benzer izleme teknolojileri kullanıyoruz. Bu teknolojiler, size daha iyi 
                bir kullanıcı deneyimi sunmamıza ve hizmetlerimizi geliştirmemize yardımcı olur.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">4. Üçüncü Taraf Hizmetleri</h2>
              <p>
                Hizmetlerimizin bir parçası olarak üçüncü taraf hizmetleri kullanabiliriz. Bu hizmetler kendi 
                gizlilik politikalarına sahiptir ve kullanıcı verilerini kendi politikalarına göre işler.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">5. Veri Saklama ve Silme</h2>
              <p>
                Kişisel verilerinizi yalnızca gerekli olduğu sürece saklarız. Hesabınızı sildiğinizde veya 
                verilerinizin silinmesini talep ettiğinizde, yasal yükümlülüklerimiz kapsamında gerekli olmadığı 
                sürece tüm verilerinizi sileriz.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">6. İletişim</h2>
              <p>
                Gizlilik politikamız hakkında sorularınız veya endişeleriniz varsa, lütfen bizimle iletişime geçin:
              </p>
              <div className="mt-2">
                <p>E-posta: info@medyaeraslan.com</p>
                <p>Telefon: +90 543 930 23 95</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">7. Güncellemeler</h2>
              <p>
                Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda sizi 
                bilgilendireceğiz. Bu politikanın son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 