"use client";
import Link from 'next/link';
import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
  const footerLinks = {
    company: [
      { name: 'Hakkımızda', href: '/about' },
      { name: 'İletişim', href: '/contact' },
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
      icon: <FaInstagram className="w-5 h-5" />,
      color: 'hover:text-pink-600'
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com',
      icon: <FaTiktok className="w-5 h-5" />,
      color: 'hover:text-black'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/905439302395',
      icon: <FaWhatsapp className="w-5 h-5" />,
      color: 'hover:text-green-600'
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-bold text-primary">
              Medya Eraslan
            </Link>
            <p className="text-gray-600 text-sm">
              Sosyal medya hizmetlerinde güvenilir çözüm ortağınız. 
              7/24 destek ve hızlı teslimat garantisi.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-600 ${item.color} transition-colors`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:col-span-3">
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Şirket</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-600 hover:text-primary text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Hizmetler</h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-600 hover:text-primary text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Yasal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-600 hover:text-primary text-sm transition-colors"
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
        <div className="border-t border-gray-100 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Medya Eraslan. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-6">
              <Link 
                href="/privacy" 
                className="text-gray-600 hover:text-primary text-sm transition-colors"
              >
                Gizlilik
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-600 hover:text-primary text-sm transition-colors"
              >
                Şartlar
              </Link>
              <Link 
                href="/cookies" 
                className="text-gray-600 hover:text-primary text-sm transition-colors"
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