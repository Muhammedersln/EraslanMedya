import Link from 'next/link';
import { FaHome, FaSearch } from 'react-icons/fa';
import Navbar from '@/components/navbar/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Animasyonlu Sayı */}
          <div className="relative">
            <h1 className="text-[150px] sm:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary/20 to-primary-dark/20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl sm:text-5xl font-bold text-gray-900">
                Ups!
              </div>
            </div>
          </div>

          {/* Mesaj */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Sayfa Bulunamadı
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
            </p>
          </div>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              <FaHome className="w-5 h-5" />
              Ana Sayfaya Dön
            </Link>
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <FaSearch className="w-5 h-5" />
              Ürünlere Göz At
            </Link>
          </div>

          {/* Dekoratif Elementler */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </main>
    </div>
  );
} 