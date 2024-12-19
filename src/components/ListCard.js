import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ListCard({ product }) {
  const { name, description, price, priceWithTax, category, subCategory, _id } = product;

  const getSubCategoryInTurkish = (subCat) => {
    const translations = {
      'followers': 'Takipçi',
      'likes': 'Beğeni',
      'views': 'İzlenme',
      'comments': 'Yorum'
    };
    return translations[subCat] || subCat;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
    >
      <div className="flex items-center p-6 gap-8">
        {/* Icon Section */}
        <div className="flex-shrink-0">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
            category === 'instagram' 
              ? 'from-pink-500 to-purple-500' 
              : 'from-[#00f2ea] to-[#ff0050]'
          } transform group-hover:scale-105 transition-transform duration-300`}>
            {category === 'instagram' ? (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 truncate">{name}</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              category === 'instagram' 
                ? 'bg-pink-100 text-pink-800' 
                : 'bg-cyan-100 text-cyan-800'
            }`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
              {getSubCategoryInTurkish(subCategory)}
            </div>
          </div>
          <p className="text-base text-gray-600 line-clamp-2 mb-4">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">KDV Hariç</div>
                <div className="text-xl font-bold text-gray-900">₺{price.toFixed(2)}</div>
              </div>
              <div className="bg-primary/5 px-4 py-2 rounded-lg">
                <div className="text-sm text-primary/80 mb-1">KDV Dahil</div>
                <div className="text-xl font-bold text-primary">₺{priceWithTax.toFixed(2)}</div>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              <Link href={`/dashboard/products/${_id}`}>
                <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors duration-300 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center gap-2">
                  <span>Ürünü İncele</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}