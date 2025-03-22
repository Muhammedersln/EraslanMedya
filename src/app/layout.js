import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import localFont from "next/font/local";
import { defaultMetadata } from '@/lib/metadata';
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap", // Hızlı font yüklemesi için
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap", // Hızlı font yüklemesi için
});

export const metadata = defaultMetadata;

function ClientLayout({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#334155',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
          success: {
            style: {
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
            },
            iconTheme: {
              primary: '#15803d',
              secondary: '#f0fdf4',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fef2f2',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background`}>
        <Script
          type="application/ld+json"
          id="schema-org"
          strategy="afterInteractive"
        >
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Eraslan Medya",
              "description": "Sosyal Medya Büyütme Hizmetleri",
              "url": "https://eraslanmedya.com",
              "logo": "https://eraslanmedya.com/logo.png",
              "image": "https://eraslanmedya.com/images/og-image.jpg",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "",
                "contactType": "customer service",
                "areaServed": "TR",
                "availableLanguage": "Turkish"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "TR"
              },
              "sameAs": [
                "https://facebook.com/eraslanmedya",
                "https://instagram.com/eraslanmedya",
                "https://twitter.com/eraslanmedya"
              ],
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "TRY",
                "highPrice": "999.99",
                "lowPrice": "9.99",
                "offerCount": "100",
                "offers": [{
                  "@type": "Offer",
                  "name": "Instagram Takipçi Hizmetleri",
                  "description": "Instagram için takipçi büyütme hizmetleri",
                  "availability": "https://schema.org/InStock"
                }, {
                  "@type": "Offer",
                  "name": "TikTok İzlenme Hizmetleri",
                  "description": "TikTok için izlenme artırma hizmetleri",
                  "availability": "https://schema.org/InStock"
                }]
              }
            }
          `}
        </Script>
        
        {/* BreadcrumbList için JSON-LD */}
        <Script
          type="application/ld+json"
          id="breadcrumbs-schema"
          strategy="afterInteractive"
        >
          {`
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Sayfa",
                "item": "https://eraslanmedya.com"
              }, {
                "@type": "ListItem",
                "position": 2,
                "name": "Hizmetler",
                "item": "https://eraslanmedya.com/dashboard/products"
              }]
            }
          `}
        </Script>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-11512697197"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-11512697197');
          `}
        </Script>
        
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
