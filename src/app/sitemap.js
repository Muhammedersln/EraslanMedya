export default async function sitemap() {
  // Statik sayfalar
  const staticPages = [
    {
      url: 'https://eraslanmedya.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: 'https://eraslanmedya.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: 'https://eraslanmedya.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: 'https://eraslanmedya.com/faq',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: 'https://eraslanmedya.com/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5
    },
    {
      url: 'https://eraslanmedya.com/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5
    },
    {
      url: 'https://eraslanmedya.com/kvkk',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4
    },
    {
      url: 'https://eraslanmedya.com/cookies',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4
    }
  ];

  // Kategori sayfaları
  const categories = [
    {
      platform: 'instagram',
      subcategories: ['followers', 'likes', 'views', 'comments'],
    },
    {
      platform: 'tiktok',
      subcategories: ['followers', 'likes', 'views', 'comments'],
    }
  ];

  const categoryPages = categories.flatMap(category => {
    const mainCategoryPage = {
      url: `https://eraslanmedya.com/dashboard/products?platform=${category.platform}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    };

    const subCategoryPages = category.subcategories.map(subcategory => ({
      url: `https://eraslanmedya.com/dashboard/products?platform=${category.platform}&subcategory=${subcategory}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7
    }));

    return [mainCategoryPage, ...subCategoryPages];
  });

  // Dinamik sayfalar (örneğin ürünler) için API çağrısı yapılabilir
  // Bu örnekte sabit bir yapı kullanıyoruz
  
  return [...staticPages, ...categoryPages];
} 