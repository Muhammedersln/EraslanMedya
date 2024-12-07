"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              EraslanMedya
            </span>
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/products">Ürünler</NavLink>
            <NavLink href="/about">Hakkımızda</NavLink>
            <NavLink href="/contact">İletişim</NavLink>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-700 hover:text-primary">
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm text-gray-700 hover:text-primary">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary text-sm font-medium transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-4 px-2">
                  <Link href="/products" className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-50">
                    Hizmetler
                  </Link>
                  <Link href="/about" className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-50">
                    Hakkımızda
                  </Link>
                  <Link href="/contact" className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-50">
                    İletişim
                  </Link>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col space-y-2 px-2">
                  {user ? (
                    <>
                      <Link 
                        href="/dashboard" 
                        className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      {user.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-50"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
                      >
                        Çıkış Yap
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-50"
                      >
                        Giriş Yap
                      </Link>
                      <Link
                        href="/register"
                        className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-dark"
                      >
                        Kayıt Ol
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function NavLink({ href, children }) {
  return (
    <Link href={href} className="relative group">
      <span className="text-gray-700 hover:text-primary transition-colors">
        {children}
      </span>
      <motion.span
        className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
        whileHover={{ width: '100%' }}
      />
    </Link>
  );
} 