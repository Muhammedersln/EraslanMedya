export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/login/',
          '/register/',
          '/api/',
          '/payment/success/',
          '/payment/cancel/'
        ]
      }
    ],
    sitemap: 'https://eraslanmedya.com/sitemap.xml',
    host: 'https://eraslanmedya.com'
  };
} 