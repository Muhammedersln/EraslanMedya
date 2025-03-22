import { createMetadata } from '@/lib/metadata';

export default function generateMetadata() {
  return createMetadata({
    title: "Kullanıcı Paneli | Eraslan Medya",
    description: "Eraslan Medya kullanıcı paneli ile sosyal medya hesaplarınız için hizmetleri yönetin, siparişlerinizi takip edin ve destek alın.",
    keywords: ["kullanıcı paneli", "sosyal medya siparişleri", "sosyal medya panel", "hesap yönetimi"],
    pathname: "/dashboard",
    noIndex: true // Kullanıcı paneli Google'da indekslenmemeli
  });
} 