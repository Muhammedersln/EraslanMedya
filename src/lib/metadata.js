// Merkezi Metadata Konfigürasyonu
export const defaultMetadata = {
  title: {
    default: "Eraslan Medya | Sosyal Medya Büyütme Hizmetleri",
    template: "%s | Eraslan Medya"
  },
  description: "Eraslan Medya ile Instagram, TikTok ve diğer sosyal medya platformları için güvenilir, hızlı ve uygun fiyatlı takipçi, beğeni ve etkileşim hizmetleri. 7/24 destek ve hızlı teslimat.",
  keywords: [
    "sosyal medya büyütme", 
    "instagram takipçi", 
    "tiktok takipçi", 
    "sosyal medya hizmetleri", 
    "instagram beğeni", 
    "tiktok izlenme", 
    "sosyal medya pazarlama", 
    "instagram hesap büyütme", 
    "tiktok hesap büyütme",
    "organik büyüme",
    "sosyal medya etkileşim"
  ],
  authors: [{ name: "Eraslan Medya" }],
  creator: "Eraslan Medya",
  publisher: "Eraslan Medya",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Eraslan Medya | Sosyal Medya Büyütme Hizmetleri",
    description: "Instagram, TikTok ve diğer sosyal medya platformları için güvenilir, hızlı ve uygun fiyatlı takipçi, beğeni ve etkileşim hizmetleri.",
    url: "https://eraslanmedya.com",
    siteName: "Eraslan Medya",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: 'https://eraslanmedya.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Eraslan Medya | Sosyal Medya Büyütme Hizmetleri',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eraslan Medya | Sosyal Medya Büyütme Hizmetleri",
    description: "Instagram, TikTok ve diğer sosyal medya platformları için güvenilir, hızlı ve uygun fiyatlı takipçi, beğeni ve etkileşim hizmetleri.",
    images: ['https://eraslanmedya.com/images/twitter-image.jpg'],
    creator: '@eraslanmedya',
    site: '@eraslanmedya',
  },
  alternates: {
    canonical: 'https://eraslanmedya.com',
    languages: {
      'tr-TR': 'https://eraslanmedya.com',
    },
  },
  metadataBase: new URL('https://eraslanmedya.com'),
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
};

// Sayfa bazlı metadata oluşturma fonksiyonu
export function createMetadata({ 
  title, 
  description, 
  keywords = [], 
  pathname = "", 
  ogImage = null,
  noIndex = false
}) {
  const url = `https://eraslanmedya.com${pathname}`;
  
  return {
    ...defaultMetadata,
    title: title,
    description: description,
    keywords: [...defaultMetadata.keywords, ...keywords],
    robots: noIndex 
      ? { index: false, follow: false }
      : defaultMetadata.robots,
    alternates: {
      ...defaultMetadata.alternates,
      canonical: url,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title,
      description: description,
      url: url,
      images: ogImage ? [ogImage] : defaultMetadata.openGraph.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title,
      description: description,
      images: ogImage ? [ogImage] : defaultMetadata.twitter.images,
    }
  };
}

// Kategori bazlı metadata oluşturma
export function createCategoryMetadata(category) {
  const categoryMappings = {
    instagram: {
      title: "Instagram Büyütme Hizmetleri | Eraslan Medya",
      description: "Instagram hesabınızı büyütmek için güvenilir takipçi, beğeni ve etkileşim hizmetleri. Hızlı teslimat ve 7/24 destek.",
      keywords: ["instagram büyütme", "instagram takipçi", "instagram beğeni", "instagram etkileşim"]
    },
    tiktok: {
      title: "TikTok Büyütme Hizmetleri | Eraslan Medya",
      description: "TikTok hesabınızı büyütmek için güvenilir takipçi, izlenme ve etkileşim hizmetleri. Hızlı teslimat ve 7/24 destek.",
      keywords: ["tiktok büyütme", "tiktok takipçi", "tiktok izlenme", "tiktok beğeni"]
    }
  };
  
  const categoryData = categoryMappings[category] || {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Hizmetleri | Eraslan Medya`,
    description: `${category.charAt(0).toUpperCase() + category.slice(1)} için sosyal medya büyütme hizmetleri. Hızlı teslimat ve 7/24 destek.`,
    keywords: [`${category} hizmetleri`]
  };
  
  return createMetadata({
    title: categoryData.title,
    description: categoryData.description,
    keywords: categoryData.keywords,
    pathname: `/dashboard/products?platform=${category}`
  });
}

// Product sayfası meta verilerini oluşturma
export function createProductMetadata(product) {
  if (!product) return defaultMetadata;
  
  return createMetadata({
    title: `${product.name} | Eraslan Medya`,
    description: product.description || defaultMetadata.description,
    keywords: [product.name.toLowerCase(), product.category.toLowerCase(), "sosyal medya"],
    pathname: `/dashboard/products/${product._id}`,
    ogImage: product.image ? {
      url: product.image,
      width: 1200,
      height: 630,
      alt: product.name
    } : null
  });
} 