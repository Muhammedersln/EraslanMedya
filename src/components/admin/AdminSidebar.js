"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MdEmail, MdClose } from "react-icons/md";
import { useState, useEffect } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { 
  RiDashboardLine, 
  RiUser3Line, 
  RiShoppingBag3Line, 
  RiShoppingCartLine,
  RiLogoutBoxRLine,
  RiSettings3Line 
} from "react-icons/ri";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Ekran boyutu değiştiğinde sidebar'ı otomatik kapat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sayfa değiştiğinde mobilde sidebar'ı kapat
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <RiDashboardLine className="w-5 h-5" /> 
    },
    { 
      path: '/admin/users', 
      label: 'Kullanıcılar', 
      icon: <RiUser3Line className="w-5 h-5" /> 
    },
    { 
      path: '/admin/products', 
      label: 'Ürünler', 
      icon: <RiShoppingBag3Line className="w-5 h-5" /> 
    },
    { 
      path: '/admin/orders', 
      label: 'Siparişler', 
      icon: <RiShoppingCartLine className="w-5 h-5" /> 
    },
    { 
      path: '/admin/support', 
      label: 'Destek Talepleri', 
      icon: <MdEmail className="w-5 h-5" />
    },
    { 
      path: '/admin/settings', 
      label: 'Ayarlar', 
      icon: <RiSettings3Line className="w-5 h-5" /> 
    }
  ];

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      logout();
    }
  };

  return (
    <>
      {/* Mobil Header - Sadece mobilde görünür */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 z-20">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
        >
          <HiMenuAlt2 className="w-6 h-6 text-primary" />
        </button>
        <span className="ml-4 font-medium text-gray-700">Admin Panel</span>
      </div>

      {/* Overlay - Sadece mobilde görünür */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `} 
        onClick={() => setIsOpen(false)} 
      />

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 inset-y-0 left-0 z-40
          w-[280px] bg-white 
          h-screen
          lg:border-r lg:border-gray-200
          lg:shadow-none
          transform transition-transform duration-300 lg:transform-none
          ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobil Kapatma Butonu - Sadece mobilde görünür */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menüyü Kapat"
        >
          <MdClose className="w-6 h-6 text-gray-500" />
        </button>

        {/* Sidebar İçeriği */}
        <div className="h-full flex flex-col p-4 sm:p-6">
          {/* Header */}
          <div className="mb-8 mt-4 lg:mt-0">
            <Link 
              href="/admin"
              className="flex items-center space-x-3"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
            </Link>
          </div>

          {/* Navigation - Scrollable Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <nav className="flex-1 space-y-1 mt-4 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all
                    hover:bg-primary/5 active:scale-[0.99]
                    ${pathname === item.path 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-gray-600 hover:text-primary'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer - Çıkış Butonu */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                  text-red-600 hover:bg-red-50 transition-colors active:scale-[0.99]"
              >
                <RiLogoutBoxRLine className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobil padding için spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
} 