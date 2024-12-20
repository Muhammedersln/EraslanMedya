"use client";
import { motion } from 'framer-motion';

export default function KVKKPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">KVKK Aydınlatma Metni</h1>
          
          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">1. Veri Sorumlusu</h2>
              <p className="mb-4">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, Medya Eraslan olarak, 
                veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında hukuka 
                uygun olarak işleyebilecek ve üçüncü kişilere aktarabileceğiz.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">2. Kişisel Verilerin İşlenme Amacı</h2>
              <p className="mb-4">
                Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Hizmetlerimizin sunulması ve geliştirilmesi</li>
                <li>Müşteri ilişkilerinin yönetimi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Güvenliğin sağlanması</li>
                <li>İletişim faaliyetlerinin yürütülmesi</li>
                <li>Hizmet kalitesinin ölçülmesi ve geliştirilmesi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">3. İşlenen Kişisel Veriler</h2>
              <p className="mb-4">
                İşlediğimiz kişisel veriler aşağıdaki kategorileri içermektedir:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Kimlik bilgileri (ad, soyad)</li>
                <li>İletişim bilgileri (e-posta, telefon, adres)</li>
                <li>Müşteri işlem bilgileri</li>
                <li>İşlem güvenliği bilgileri</li>
                <li>Finansal bilgiler</li>
                <li>Sosyal medya hesap bilgileri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">4. Kişisel Verilerin Aktarılması</h2>
              <p className="mb-4">
                Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda, 
                aşağıdaki taraflara aktarılabilir:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Yasal yükümlülüklerimiz gereği kamu kurumları</li>
                <li>Hizmet aldığımız tedarikçiler ve iş ortakları</li>
                <li>Ödeme ve finansal işlemler için bankalar</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">5. Kişisel Veri Sahibinin Hakları</h2>
              <p className="mb-4">
                KVKK&apos;nın 11. maddesi uyarınca sahip olduğunuz haklar:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">6. Veri Güvenliği</h2>
              <p>
                Kişisel verilerinizin güvenliğini sağlamak için teknik ve idari tedbirler alınmaktadır. 
                Bu kapsamda, veri kayıplarını ve hukuka aykırı veri işlenmesini önlemek için gerekli 
                güvenlik düzeyi sağlanmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">7. İletişim</h2>
              <p>
                KVKK kapsamındaki haklarınızı kullanmak için veya sorularınız için bize ulaşın:
              </p>
              <div className="mt-2">
                <p>E-posta: info@medyaeraslan.com</p>
                <p>Telefon: +90 543 930 23 95</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">8. Güncellemeler</h2>
              <p>
                Bu aydınlatma metni, yasal düzenlemeler ve şirket politikalarındaki değişiklikler doğrultusunda 
                güncellenebilir. Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR')}.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 