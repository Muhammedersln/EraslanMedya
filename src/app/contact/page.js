"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdPhone, MdSend } from 'react-icons/md';
import Navbar from '@/components/navbar/Navbar';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '@/utils/constants';
import Footer from '@/components/Footer';

export default function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Mesaj gönderilemedi');
      }

      toast.success('Mesajınız başarıyla gönderildi!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('İletişim formu hatası:', error);
      toast.error('Mesaj gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <MdPhone className="w-8 h-8" />,
      title: "Telefon",
      details: "+90 543 930 23 95",
      link: "tel:+905439302395",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <MdEmail className="w-8 h-8" />,
      title: "E-posta",
      details: "eraslanmedya@gmail.com",
      link: "mailto:eraslanmedya@gmail.com",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: <MdLocationOn className="w-8 h-8" />,
      title: "Adres",
      details: "İstanbul, Türkiye",
      link: "https://maps.google.com",
      color: "bg-red-50 text-red-600"
    }
  ];

  const socialLinks = [
    {
      icon: <FaInstagram className="w-7 h-7" />,
      name: "Instagram",
      url: "https://instagram.com/muhammeder.0",
      color: "bg-gradient-to-br from-purple-600 to-pink-500 text-white"
    },
    {
      icon: <FaTiktok className="w-7 h-7" />,
      name: "TikTok", 
      url: "https://tiktok.com",
      color: "bg-black text-white"
    },
    {
      icon: <FaWhatsapp className="w-7 h-7" />,
      name: "WhatsApp",
      url: "https://wa.me/905439302395",
      color: "bg-green-500 text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-grow mt-16">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary overflow-hidden py-24">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-10"
          />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-6xl font-bold mb-6 text-white"
              >
                Bizimle İletişime Geçin
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-white/90 leading-relaxed"
              >
                Sorularınız ve önerileriniz için 7/24 hizmetinizdeyiz. Size yardımcı olmaktan mutluluk duyarız.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Information Cards */}
            {contactInfo.map((item, index) => (
              <motion.a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`${item.color} p-8 rounded-2xl shadow-lg backdrop-blur-lg flex flex-col items-center text-center`}
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="opacity-90">{item.details}</p>
              </motion.a>
            ))}
          </div>

          <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Mesaj Gönderin</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adınız
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Adınızı girin"
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                      placeholder="E-posta adresiniz"
                    />
                  </motion.div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konu
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Mesaj konusu"
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="Mesajınızı yazın..."
                  />
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-primary hover:bg-primary-dark text-white py-4 px-8 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <MdSend className="w-6 h-6" />
                      <span>Mesaj Gönder</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Social Media Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Sosyal Medya</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${social.color} p-6 rounded-2xl flex items-center justify-center transition-transform duration-200 shadow-lg hover:shadow-xl`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
              <p className="text-gray-600 text-center mt-8">
                Sosyal medya hesaplarımızdan bizi takip edebilir ve güncel kalabilirsiniz.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}