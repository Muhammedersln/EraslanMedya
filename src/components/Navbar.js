"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-secondary/10 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary hover:text-primary-dark transition-colors">
              Medya Eraslan
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-text-light hover:text-primary transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/products" className="text-text-light hover:text-primary transition-colors">
              Ürünler
            </Link>
            <Link href="/about" className="text-text-light hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="text-text-light hover:text-primary transition-colors">
              İletişim
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center">
            {user ? (
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
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-text-light hover:text-primary transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4"
            >
              <div className="flex flex-col space-y-4">
                <Link href="/dashboard" className="px-4 py-2 text-text-light hover:text-primary transition-colors">
                  Ana Sayfa
                </Link>
                <Link href="/products" className="px-4 py-2 text-text-light hover:text-primary transition-colors">
                  Ürünler
                </Link>
                <Link href="/about" className="px-4 py-2 text-text-light hover:text-primary transition-colors">
                  Hakkımızda
                </Link>
                <Link href="/contact" className="px-4 py-2 text-text-light hover:text-primary transition-colors">
                  İletişim
                </Link>
                
                {user ? (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <div className="px-4 py-2">
                        <p className="font-medium text-text">{user?.username}</p>
                        <p className="text-text-light text-sm">{user?.email}</p>
                      </div>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-text-light hover:text-primary"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 bg-primary text-white rounded-lg mx-4"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}