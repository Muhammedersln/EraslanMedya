"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from 'react';
import { MdEmail, MdDashboard, MdShoppingBag, MdShoppingCart, MdMenu, MdClose, MdLogin, MdPersonAdd, MdHeadsetMic, MdReceipt, MdExpandMore } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigation = [
    {
      name: 'Ana Sayfa',
      href: user ? '/dashboard' : '/',
      icon: <MdDashboard className="w-5 h-5 sm:w-6 sm:h-6" />,
      current: pathname === '/dashboard' || pathname === '/'
    },
    {
      name: 'Ürünler',
      href: '/products',
      icon: <MdShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
      current: pathname === '/products'
    },
    {
      name: 'Siparişlerim',
      href: '/dashboard/orders',
      icon: <MdReceipt className="w-5 h-5 sm:w-6 sm:h-6" />,
      requiresAuth: true,
      current: pathname === '/dashboard/orders'
    },
    {
      name: 'Sepetim',
      href: '/dashboard/cart',
      icon: <MdShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />,
      requiresAuth: true,
      current: pathname === '/dashboard/cart'
    },
    {
      name: user ? 'Destek' : 'İletişim',
      href: user ? '/dashboard/support' : '/contact',
      icon: user ? <MdHeadsetMic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MdEmail className="w-5 h-5 sm:w-6 sm:h-6" />,
      current: user ? pathname === '/dashboard/support' : pathname === '/contact'
    }
  ];

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`${API_URL}/api/cart/count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const { count } = await response.json();
          setCartItemCount(count);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };

    fetchCartCount();

    // Subscribe to cart updates
    window.addEventListener('cartUpdated', fetchCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/'); // Ana sayfaya yönlendir
  };

  return (
    <nav className="bg-white shadow-sm border-b border-secondary/10 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Mobil Menü Butonu ve Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <MdClose className="h-5 w-5 transition-transform duration-200 rotate-180" />
              ) : (
                <MdMenu className="h-5 w-5 transition-transform duration-200" />
              )}
            </button>
            
            {/* Logo */}
            <Link href={user ? "/dashboard" : "/"} className="text-lg sm:text-xl font-bold text-primary hover:text-primary-dark transition-colors">
              Medya Eraslan
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              (!item.requiresAuth || (item.requiresAuth && user)) && (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 text-sm lg:text-base ${
                    item.current
                      ? 'text-primary font-medium'
                      : 'text-gray-600 hover:text-primary'
                  } transition-colors`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.name === 'Sepetim' && cartItemCount > 0 && (
                    <span className="ml-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center">
            {user ? (
              <>
                {/* Mobile Profil Butonu */}
                <div className="md:hidden relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-1 p-1.5 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                      <span className="text-white text-sm">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <MdExpandMore className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mobile Profil Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <FaUserCircle className="w-4 h-4 mr-3 text-primary" />
                        <span>Profil</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Çıkış</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop Profil Butonu */}
                <div className="hidden md:block relative">
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center space-x-3 hover:bg-gray-50/80 p-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md">
                        <span className="text-white font-medium text-sm sm:text-base">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base">
                        <p className="font-medium text-gray-800">{user?.username}</p>
                        <p className="text-gray-500 text-xs sm:text-sm">{user?.email}</p>
                      </div>
                    </button>

                    {/* Profile Dropdown */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 z-50 border border-gray-100">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FaUserCircle className="w-4 h-4 mr-3 text-primary" />
                          <span>Profil Ayarları</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors text-sm sm:text-base"
                  >
                    <FaUserCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Giriş Yap</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <MdPersonAdd className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Kayıt Ol</span>
                  </Link>
                </div>

                {/* Mobile Auth Button */}
                <Link
                  href="/login"
                  className="md:hidden flex items-center space-x-1 p-1.5 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <FaUserCircle className="w-5 h-5 text-white" />
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobil Menü */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                (!item.requiresAuth || (item.requiresAuth && user)) && (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transform transition-all duration-200 ${
                      item.current
                        ? 'bg-primary/10 text-primary font-medium translate-x-2'
                        : 'text-gray-600 hover:bg-gray-50 hover:translate-x-2'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.name === 'Sepetim' && cartItemCount > 0 && (
                      <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )
              ))}
              
              {/* Mobile Menu Auth Buttons */}
              {!user && (
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link
                    href="/login"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:translate-x-2 transform transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUserCircle className="w-5 h-5" />
                    <span>Giriş Yap</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-3 px-4 py-3 mx-4 mt-2 bg-primary text-white rounded-lg hover:bg-primary-dark transform transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MdPersonAdd className="w-5 h-5" />
                    <span>Kayıt Ol</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 