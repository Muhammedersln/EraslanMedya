"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from 'react';
import { MdEmail, MdDashboard, MdShoppingBag, MdShoppingCart } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigation = [
    {
      name: 'Panel',
      href: '/dashboard',
      icon: <MdDashboard className="w-6 h-6" />,
      current: pathname === '/dashboard'
    },
    {
      name: 'Ürünler',
      href: '/products',
      icon: <MdShoppingBag className="w-6 h-6" />,
      current: pathname === '/products'
    },
    {
      name: 'Sepetim',
      href: '/dashboard/cart',
      icon: <MdShoppingCart className="w-6 h-6" />,
      current: pathname === '/dashboard/cart'
    },
    {
      name: 'Destek',
      href: '/dashboard/support',
      icon: <MdEmail className="w-6 h-6" />,
      current: pathname === '/dashboard/support'
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
    <nav className="bg-white shadow-sm border-b border-secondary/10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="text-xl font-bold text-primary hover:text-primary-dark transition-colors">
              Medya Eraslan
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-text-light hover:text-primary transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/dashboard/products" className="text-text-light hover:text-primary transition-colors">
              Ürünler
            </Link>
            <Link href="/dashboard/orders" className="text-text-light hover:text-primary transition-colors">
              Siparişlerim
            </Link>
            <Link href="/dashboard/cart" className="text-text-light hover:text-primary transition-colors flex items-center">
              <span>Sepetim</span>
              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{cartItemCount}</span>
            </Link>
            <Link href="/dashboard/support" className="text-text-light hover:text-primary transition-colors">
              Destek
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 hover:bg-gray-50/80 p-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="text-sm hidden md:block">
                  <p className="font-semibold text-gray-800">{user?.username}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profil Menüsü */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 z-50 border border-gray-100 transform transition-all duration-200">
                  <Link
                    href="/dashboard/profile"
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
        </div>
      </div>
    </nav>
  );
} 