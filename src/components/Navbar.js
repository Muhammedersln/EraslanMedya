"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-8 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors">
              Medya Eraslan
            </Link>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-text-light hover:text-primary"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-text-light hover:text-primary transition-colors font-medium">
              Ürünler
            </Link>
            <Link href="/services" className="text-text-light hover:text-primary transition-colors font-medium">
              Hizmetlerimiz
            </Link>
            <Link href="/contact" className="text-text-light hover:text-primary transition-colors font-medium">
              İletişim
            </Link>
            <Link href="/login" className="text-text-light hover:text-primary transition-colors font-medium">
              Giriş Yap
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/15 transition-colors font-medium"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-4`}>
          <div className="flex flex-col space-y-4 bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-lg">
            <Link 
              href="/products" 
              className="text-text-light hover:text-primary transition-colors font-medium px-4 py-2 hover:bg-primary/5 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Ürünler
            </Link>
            <Link 
              href="/services" 
              className="text-text-light hover:text-primary transition-colors font-medium px-4 py-2 hover:bg-primary/5 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Hizmetlerimiz
            </Link>
            <Link 
              href="/contact" 
              className="text-text-light hover:text-primary transition-colors font-medium px-4 py-2 hover:bg-primary/5 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              İletişim
            </Link>
            <Link 
              href="/login" 
              className="text-text-light hover:text-primary transition-colors font-medium px-4 py-2 hover:bg-primary/5 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Giriş Yap
            </Link>
            <Link 
              href="/register" 
              className="bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/15 transition-colors font-medium text-center"
              onClick={() => setIsOpen(false)}
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 