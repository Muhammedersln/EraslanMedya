"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaTiktok, FaWhatsapp, FaArrowRight } from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdPhone, MdSend, MdAccessTime } from 'react-icons/md';
import Navbar from '@/components/navbar/Navbar';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
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
  const [activeCard, setActiveCard] = useState(null);

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
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Mesaj gönderilemedi');
      }

      toast.success('Mesajınız başarıyla gönderildi! Size e-posta ile bilgi verdik.');
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('İletişim formu hatası:', error);
      toast.error(error.message || 'Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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
      color: "bg-blue-50 text-blue-600",
      hoverColor: "hover:bg-blue-100"
    },
    {
      icon: <MdEmail className="w-8 h-8" />,
      title: "E-posta",
      details: "eraslanmedya@gmail.com",
      link: "mailto:eraslanmedya@gmail.com",
      color: "bg-purple-50 text-purple-600",
      hoverColor: "hover:bg-purple-100"
    },
    {
      icon: <MdLocationOn className="w-8 h-8" />,
      title: "Adres",
      details: "İstanbul, Türkiye",
      link: "https://maps.google.com",
      color: "bg-red-50 text-red-600",
      hoverColor: "hover:bg-red-100"
    }
  ];

  const socialLinks = [
    {
      icon: <FaInstagram className="w-7 h-7" />,
      name: "Instagram",
      url: "https://instagram.com/muhammeder.0",
      color: "bg-gradient-to-br from-purple-600 to-pink-500 text-white",
      description: ""
    },
    {
      icon: <FaTiktok className="w-7 h-7" />,
      name: "TikTok", 
      url: "https://tiktok.com",
      color: "bg-black text-white",
      description: ""
    },
    {
      icon: <FaWhatsapp className="w-7 h-7" />,
      name: "WhatsApp",
      url: "https://wa.me/905439302395",
      color: "bg-green-500 text-white",
      description: ""
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
            className="absolute inset-0  bg-repeat opacity-10"
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
                whileHover={{ y: -5, scale: 1.02 }}
                onHoverStart={() => setActiveCard(index)}
                onHoverEnd={() => setActiveCard(null)}
                className={`${item.color} ${item.hoverColor} p-8 rounded-2xl shadow-lg backdrop-blur-lg flex flex-col items-center justify-center text-center group transition-all duration-300 relative overflow-hidden h-[200px]`}
              >
                <div className="absolute inset-0 bg-white/50 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-4 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="opacity-90">{item.details}</p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: activeCard === index ? 1 : 0, y: activeCard === index ? 0 : 10 }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <span>İletişime Geç</span>
                    <FaArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-purple-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-purple-400/10 rounded-full blur-3xl" />
              
              <div className="relative">
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
                      placeholder="Örn: Hizmetleriniz hakkında bilgi almak istiyorum"
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
                      placeholder="Mesajınızı detaylı bir şekilde yazın..."
                    />
                  </motion.div>

                  <div className="text-sm text-gray-500 mt-2">
                    Size en kısa sürede e-posta ile dönüş yapacağız.
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !formData.name || !formData.email || !formData.subject || !formData.message}
                    className={`w-full bg-primary hover:bg-primary-dark text-white py-4 px-8 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group 
                      ${loading || !formData.name || !formData.email || !formData.subject || !formData.message ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700" />
                    <div className="relative flex items-center gap-3">
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
                    </div>
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Social Media and Working Hours Section */}
            <div className="space-y-8">
              {/* Social Media Section */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-purple-400/10 rounded-full blur-3xl" />
                <div className="relative">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Sosyal Medya</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${social.color} p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden h-[140px]`}
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700" />
                        <div className="relative flex flex-col items-center justify-center">
                          <div className="transform group-hover:scale-110 transition-transform duration-300">
                            {social.icon}
                          </div>
                          <div className="mt-2 font-medium">{social.name}</div>
                          {social.description && (
                            <div className="text-xs mt-1 opacity-90">{social.description}</div>
                          )}
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}