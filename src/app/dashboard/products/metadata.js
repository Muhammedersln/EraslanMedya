import { createMetadata } from '@/lib/metadata';

export default function generateMetadata({ searchParams }) {
  const platform = searchParams?.platform || 'all';
  const subcategory = searchParams?.subcategory || 'all';
  
  // Platform bazlı başlık
  let title = "Sosyal Medya Büyütme Hizmetleri | Eraslan Medya";
  let description = "Instagram, TikTok ve diğer sosyal medya platformları için güvenilir takipçi, beğeni ve etkileşim hizmetleri. 7/24 destek ve hızlı teslimat.";
  let keywords = [];
  
  if (platform === 'instagram') {
    title = "Instagram Büyütme Hizmetleri | Eraslan Medya";
    description = "Instagram hesabınızı büyütmek için güvenilir takipçi, beğeni ve etkileşim hizmetleri. Türk ve yabancı gerçek hesaplar.";
    keywords = ["instagram takipçi", "instagram beğeni", "instagram yorum", "instagram etkileşim"];
    
    if (subcategory === 'followers') {
      title = "Instagram Takipçi Paketleri | Eraslan Medya";
      description = "Instagram hesabınız için güvenilir Türk ve yabancı takipçi paketleri. Gerçek hesaplarla etkileşiminizi artırın.";
      keywords = ["instagram türk takipçi", "instagram yabancı takipçi", "instagram organik takipçi", "instagram takipçi satın al"];
    } else if (subcategory === 'likes') {
      title = "Instagram Beğeni Paketleri | Eraslan Medya";
      description = "Instagram gönderileriniz için profesyonel beğeni hizmetleri. Gönderilerinizin etkileşimini artırın.";
      keywords = ["instagram beğeni satın al", "instagram post beğeni", "instagram gönderi beğeni", "instagram beğeni hilesi"];
    } else if (subcategory === 'views') {
      title = "Instagram İzlenme Paketleri | Eraslan Medya";
      description = "Instagram Story, Reel ve video içerikleriniz için izlenme hizmetleri. İçeriklerinizin daha fazla kişiye ulaşmasını sağlayın.";
      keywords = ["instagram story izlenme", "instagram reel izlenme", "instagram video izlenme", "instagram görüntülenme"];
    }
  } else if (platform === 'tiktok') {
    title = "TikTok Büyütme Hizmetleri | Eraslan Medya";
    description = "TikTok hesabınızı büyütmek için güvenilir takipçi, beğeni ve izlenme hizmetleri. TikTok'ta fenomen olmanın yolu.";
    keywords = ["tiktok takipçi", "tiktok beğeni", "tiktok izlenme", "tiktok etkileşim"];
    
    if (subcategory === 'followers') {
      title = "TikTok Takipçi Paketleri | Eraslan Medya";
      description = "TikTok hesabınız için güvenilir takipçi paketleri. TikTok'ta popülaritesini artırın ve daha fazla kişiye ulaşın.";
      keywords = ["tiktok takipçi satın al", "tiktok organik takipçi", "tiktok takipçi kasma", "tiktok takipçi hilesi"];
    } else if (subcategory === 'likes') {
      title = "TikTok Beğeni Paketleri | Eraslan Medya";
      description = "TikTok videolarınız için profesyonel beğeni hizmetleri. Videolarınızın etkileşimini artırın ve keşfete düşme şansınızı yükseltin.";
      keywords = ["tiktok beğeni satın al", "tiktok beğeni hilesi", "tiktok video beğeni", "tiktok like"];
    } else if (subcategory === 'views') {
      title = "TikTok İzlenme Paketleri | Eraslan Medya";
      description = "TikTok videolarınız için izlenme hizmetleri. İçeriklerinizin daha fazla kişiye ulaşmasını sağlayın ve keşfette öne çıkın.";
      keywords = ["tiktok izlenme satın al", "tiktok video izlenme", "tiktok görüntülenme arttırma", "tiktok görüntülenme hilesi"];
    }
  }
  
  return createMetadata({
    title,
    description,
    keywords,
    pathname: `/dashboard/products${platform !== 'all' ? `?platform=${platform}${subcategory !== 'all' ? `&subcategory=${subcategory}` : ''}` : ''}`,
  });
} 