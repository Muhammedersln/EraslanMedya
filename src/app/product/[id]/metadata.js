import { createMetadata } from '@/lib/metadata';

// Bu fonksiyon ürün detaylarını almaya çalışacak ve metadata oluşturacak
export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    // Ürün verilerini getir
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://eraslanmedya.com'}/api/products/${id}`, { 
      next: { revalidate: 3600 } // 1 saat cache
    });
    
    if (!response.ok) {
      // Ürün bulunamadıysa genel meta verileri döndür
      return createMetadata({
        title: "Ürün Detayları | Eraslan Medya",
        description: "Sosyal medya hesaplarınızı büyütmek için ürün ve hizmetlerimizi keşfedin.",
        pathname: `/product/${id}`
      });
    }
    
    const product = await response.json();
    
    // Zengin metadata oluştur
    return createMetadata({
      title: `${product.name} | Eraslan Medya`,
      description: product.description || "Eraslan Medya'nın profesyonel sosyal medya büyütme çözümleri ile hesaplarınızı hızla büyütün.",
      keywords: [
        product.name.toLowerCase(),
        product.category.toLowerCase(),
        `${product.category} hizmetleri`,
        `sosyal medya ${product.category}`,
        `${product.platform} ${product.category}`
      ],
      pathname: `/product/${id}`,
      ogImage: product.image ? {
        url: product.image,
        width: 1200,
        height: 630,
        alt: product.name
      } : null
    });
    
  } catch (error) {
    console.error('Error fetching product metadata:', error);
    // Hata durumunda genel meta verileri döndür
    return createMetadata({
      title: "Ürün Detayları | Eraslan Medya",
      description: "Sosyal medya hesaplarınızı büyütmek için ürün ve hizmetlerimizi keşfedin.",
      pathname: `/product/${id}`
    });
  }
} 