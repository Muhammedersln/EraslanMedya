"use client";
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";

export default function DashboardNavbar() {
  const { user, logout } = useAuth();

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
              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">0</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-r pr-4 mr-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-text">{user?.username}</p>
                <p className="text-text-light text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sm px-4 py-2 text-text-light hover:text-primary transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 