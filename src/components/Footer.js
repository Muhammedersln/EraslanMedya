"use client";
import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
  const footerLinks = {
    company: [
      { name: 'Hakkımızda', href: '/about' },
      { name: 'İletişim', href: '/contact' },
      { name: 'Sık Sorulan Sorular', href: '/faq' },
    ],
    services: [
      { name: 'Instagram Hizmetleri', href: '/products?category=instagram' },
      { name: 'TikTok Hizmetleri', href: '/products?category=tiktok' },
    ],
    legal: [
      { name: 'Gizlilik Politikası', href: '/privacy' },
      { name: 'Kullanım Şartları', href: '/terms' },
      { name: 'KVKK', href: '/kvkk' },
    ],
  };

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/muhammeder.0',
      icon: <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'hover:text-pink-500 hover:scale-110'
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com',
      icon: <FaTiktok className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'hover:text-black hover:scale-110'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/905439302395',
      icon: <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'hover:text-green-500 hover:scale-110'
    },
  ];

  return (
    <footer className="relative mt-12 sm:mt-16 overflow-hidden ">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
      
      <div className="relative container mx-auto px-4 py-8 sm:py-16 md:pb-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4 sm:space-y-6">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Medya Eraslan
              </h2>
            </Link>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Sosyal medya yolculuğunuzda güvenilir çözüm ortağınız. 
              7/24 destek ve hızlı teslimat garantisiyle yanınızdayız.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
              {socialLinks.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-600 transition-all duration-300 ${item.color}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Şirket</h3>
              <ul className="space-y-3 sm:space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Hizmetler</h3>
              <ul className="space-y-3 sm:space-y-4">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 sm:space-y-6 col-span-2 sm:col-span-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Yasal</h3>
              <ul className="space-y-3 sm:space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center sm:items-start gap-4">
              <div className="flex items-center gap-6">
                <Image 
                  src="/images/Visa_Inc._logo.svg.png"
                  alt="Visa"
                  width={60}
                  height={20}
                  className="object-contain"
                />
                <Image 
                  src="/images/Mastercard-logo.svg.png"
                  alt="Mastercard"
                  width={50}
                  height={30}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left">
                © {new Date().getFullYear()} Medya Eraslan. Tüm hakları saklıdır.
              </p>
            </div>
            <div className="flex items-center gap-6 sm:gap-8">
              <Link 
                href="/privacy" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm sm:text-base"
              >
                Gizlilik
              </Link>
              <Link 
                href="/terms" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm sm:text-base"
              >
                Şartlar
              </Link>
              <Link 
                href="/cookies" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm sm:text-base"
              >
                Çerezler
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 