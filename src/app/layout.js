import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Eraslan Medya",
  description: "Eraslan Medya | Sosyal Medya Pazarlama",
  icons: {
    icon: [
      {
        rel: 'icon',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0RjQ2RTUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIgZmlsbD0idXJsKCNhKSIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xNjAgMTYwaDgwdjE5MmgtNDB2LTgwSDE2MHYtNDBIMjAwdi0zMkgxNjB6TTMwMCAxNjBoNTJ2NDBIMzAwdjcyaDUydjQwSDMwMHYtMTUyeiIvPjwvc3ZnPg==',
        type: 'image/svg+xml'
      }
    ]
  }
};

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
    <html lang="tr">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background `}>
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
