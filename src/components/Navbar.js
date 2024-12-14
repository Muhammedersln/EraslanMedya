"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MdEmail, MdDashboard, MdShoppingBag, MdShoppingCart, MdMenu, MdClose, MdLogout, MdLogin, MdPersonAdd } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    {
      name: 'Ana Sayfa',
      href: '/dashboard',
      icon: <MdDashboard className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: 'Ürünler',
      href: '/products',
      icon: <MdShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: 'Siparişlerim',
      href: '/orders',
      icon: <MdShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: 'İletişim',
      href: '/contact',
      icon: <MdEmail className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-secondary/10 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Hamburger ve Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? (
                <MdClose className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 rotate-180" />
              ) : (
                <MdMenu className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200" />
              )}
            </button>
            <Link href="/" className="text-xl sm:text-2xl font-bold text-primary hover:text-primary-dark transition-colors">
              Medya Eraslan
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors text-sm lg:text-base"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 border-r pr-4 mr-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md">
                    <span className="text-white font-medium text-sm sm:text-base">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base">
                    <p className="font-medium text-text">{user?.username}</p>
                    <p className="text-text-light text-xs sm:text-sm">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-sm sm:text-base px-4 py-2 text-text-light hover:text-primary transition-colors"
                >
                  <MdLogout className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors text-sm sm:text-base"
                >
                  <MdLogin className="w-5 h-5 sm:w-6 sm:h-6" />
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
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transform transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:translate-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="text-sm sm:text-base">{item.name}</span>
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="border-t pt-4 mt-4">
                    <div className="px-4 py-2 flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                        <span className="text-white font-medium text-sm sm:text-base">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-text text-sm sm:text-base">{user?.username}</p>
                        <p className="text-text-light text-xs sm:text-sm">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 text-sm sm:text-base"
                    >
                      <MdLogout className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-4 py-3 text-text-light hover:text-primary text-sm sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    <MdLogin className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Giriş Yap</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-2 mx-4 px-4 py-3 bg-primary text-white rounded-lg text-sm sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    <MdPersonAdd className="w-5 h-5 sm:w-6 sm:h-6" />
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