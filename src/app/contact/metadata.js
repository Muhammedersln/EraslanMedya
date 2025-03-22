import { createMetadata } from '@/lib/metadata';

export default function generateMetadata() {
  return createMetadata({
    title: "İletişim | Eraslan Medya",
    description: "Eraslan Medya ile iletişime geçin. Sorularınızı yanıtlamaktan, önerilerinizi dinlemekten ve sizlere yardımcı olmaktan mutluluk duyarız.",
    keywords: ["iletişim", "sosyal medya destek", "müşteri hizmetleri", "iletişim formu"],
    pathname: "/contact"
  });
} 