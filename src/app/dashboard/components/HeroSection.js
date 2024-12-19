"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaInstagram, FaTiktok, FaClock, FaLock, FaCheck } from "react-icons/fa";

export default function HeroSection({ user }) {
    const router = useRouter();

    const infoItems = [
        {
            icon: <FaClock className="w-3.5 h-3.5" />,
            text: "60 dk içinde gelmeye başlar",
            gradient: "from-green-500 to-emerald-600"
        },
        {
            icon: <FaLock className="w-3.5 h-3.5" />,
            text: "Hesabınız gizli olmamalı",
            gradient: "from-red-500 to-rose-600"
        },
        {
            icon: <FaCheck className="w-3.5 h-3.5" />,
            text: "365 gün garantili",
            gradient: "from-blue-500 to-indigo-600"
        }
    ];

    const platforms = [
        {
            icon: <FaInstagram className="w-8 h-8" />,
            name: "Instagram",
            gradient: "from-pink-500 to-purple-600",
            platform: "instagram",
            description: ""
        },
        {
            icon: <FaTiktok className="w-8 h-8" />,
            name: "TikTok",
            gradient: "from-blue-500 to-cyan-500",
            platform: "tiktok",
            description: ""
        }
    ];

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-purple-50/50 to-white mb-12">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-400/20 backdrop-blur-3xl"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-6 md:p-10">
                <div className="max-w-5xl mx-auto">
                    {/* Üst Kısım */}
                    <div className="flex justify-between items-start mb-16">
                        {/* Hoş Geldin */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                {user.firstName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
                                    Hoş Geldiniz, {user.firstName}! 👋
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    Sosyal medya yolculuğunuza başlayalım
                                </p>
                            </div>
                        </motion.div>

                        {/* Minimal Bilgi Kartları */}
                        <div className="flex gap-3">
                            {infoItems.map((item, index) => (
                                <motion.div
                                    key={item.text}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20"
                                >
                                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Ana İçerik - Merkez */}
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary text-transparent bg-clip-text mb-4">
                                Sosyal Medya Büyütme Merkezi
                            </h1>
                            <p className="text-gray-600 text-base md:text-lg max-w-xl mx-auto mb-12">
                                Takipçi, beğeni ve izlenme sayınızı hızlıca artırın
                            </p>
                            
                            {/* Sosyal Medya İkonları */}
                            <div className="flex justify-center gap-8 mb-12">
                                {platforms.map((platform, index) => (
                                    <motion.div
                                        key={platform.platform}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push(`/dashboard/products?platform=${platform.platform}`)}
                                        className="group cursor-pointer"
                                    >
                                        <div className={`w-32 bg-gradient-to-br ${platform.gradient} rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 text-white`}>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="transform group-hover:scale-110 transition-transform duration-300">
                                                    {platform.icon}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{platform.name}</div>
                                                    <div className="text-xs text-white/80 mt-1">{platform.description}</div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Aksiyon Butonları */}
                            <div className="flex justify-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/dashboard/products')}
                                    className="bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-xl font-medium text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                                >
                                    🚀 Hizmetleri Keşfet
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/dashboard/orders')}
                                    className="bg-white text-gray-700 px-8 py-4 rounded-xl font-medium text-base shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-300"
                                >
                                    📦 Siparişlerim
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
} 