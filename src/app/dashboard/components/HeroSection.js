"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaInstagram, FaTiktok, FaClock, FaLock, FaCheck } from "react-icons/fa";

export default function HeroSection({ user }) {
    const router = useRouter();

    const infoItems = [
        {
            icon: <FaClock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
            text: "60 dk içinde gelmeye başlar",
            gradient: "from-green-500 to-emerald-600"
        },
        {
            icon: <FaLock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
            text: "Hesabınız gizli olmamalı",
            gradient: "from-red-500 to-rose-600"
        },
        {
            icon: <FaCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
            text: "Takipçi düşüşleri minimum seviyede!",
            gradient: "from-blue-500 to-indigo-600"
        }
    ];

    const platforms = [
        {
            icon: <FaInstagram className="w-6 h-6 sm:w-8 sm:h-8" />,
            name: "Instagram",
            gradient: "from-pink-500 to-purple-600",
            platform: "instagram",
            description: "Takipçi & Beğeni"
        },
        {
            icon: <FaTiktok className="w-6 h-6 sm:w-8 sm:h-8" />,
            name: "TikTok",
            gradient: "from-blue-500 to-cyan-500",
            platform: "tiktok",
            description: "Takipçi & İzlenme"
        }
    ];

    return (
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 via-purple-50/50 to-white mb-6 sm:mb-8 md:mb-12">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-400/20 backdrop-blur-3xl"></div>
                <div className="absolute top-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="max-w-5xl mx-auto">
                    {/* Üst Kısım */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
                        {/* Hoş Geldin */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 sm:gap-4"
                        >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg">
                                {user.firstName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
                                    Hoş Geldiniz, {user.firstName}! 👋
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                                    Sosyal medya yolculuğunuza başlayalım
                                </p>
                            </div>
                        </motion.div>

                        {/* Minimal Bilgi Kartları */}
                        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 w-full sm:w-auto">
                            {infoItems.map((item, index) => (
                                <motion.div
                                    key={item.text}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    className="flex items-center gap-1.5 sm:gap-2 bg-white/50 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 flex-1 sm:flex-initial"
                                >
                                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-medium text-gray-700 whitespace-nowrap">{item.text}</span>
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
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary text-transparent bg-clip-text mb-3 sm:mb-4">
                                Sosyal Medya Büyütme Merkezi
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-8 sm:mb-12">
                                Takipçi, beğeni ve izlenme sayınızı hızlıca artırın
                            </p>
                            
                            {/* Sosyal Medya İkonları */}
                            <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
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
                                        <div className={`w-24 sm:w-28 md:w-32 bg-gradient-to-br ${platform.gradient} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 text-white`}>
                                            <div className="flex flex-col items-center gap-2 sm:gap-3">
                                                <div className="transform group-hover:scale-110 transition-transform duration-300">
                                                    {platform.icon}
                                                </div>
                                                <div>
                                                    <div className="text-sm sm:text-base font-semibold">{platform.name}</div>
                                                    <div className="text-[10px] sm:text-xs text-white/80 mt-0.5 sm:mt-1">{platform.description}</div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl sm:rounded-2xl"></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Aksiyon Butonları */}
                            <div className="flex flex-col xs:flex-row justify-center gap-3 sm:gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/dashboard/products')}
                                    className="w-full xs:w-auto bg-gradient-to-r from-primary to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-sm sm:text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                                >
                                    🚀 Hizmetleri Keşfet
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/dashboard/orders')}
                                    className="w-full xs:w-auto bg-white text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-sm sm:text-base shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-300"
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