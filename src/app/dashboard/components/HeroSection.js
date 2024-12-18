"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaShoppingBag, FaChartLine, FaRegClock } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function HeroSection({ user, orderCount, cartCount }) {
    const router = useRouter();
    const [lastOrderDate, setLastOrderDate] = useState(null);

    // Son sipariş tarihini formatla
    const formatLastOrderDate = (date) => {
        if (!date) return "Henüz sipariş yok";

        const orderDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffMinutes < 60) {
            return `${diffMinutes} dakika önce`;
        } else if (diffHours < 24) {
            return `${diffHours} saat önce`;
        } else if (diffDays === 1) {
            return "Dün";
        } else if (diffDays < 7) {
            return `${diffDays} gün önce`;
        } else {
            return orderDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long'
            });
        }
    };

    // Son sipariş tarihini al
    const fetchLastOrderDate = async () => {
        try {
            const response = await fetch('/api/orders/last-order-date', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Son sipariş tarihi alınamadı');
            const data = await response.json();
            setLastOrderDate(data.lastOrderDate);
        } catch (error) {
            console.error('Son sipariş tarihi alınırken hata:', error);
            setLastOrderDate(null);
        }
    };

    useEffect(() => {
        fetchLastOrderDate();
    }, []);

    const stats = [
        {
            id: 1,
            title: "Toplam Sipariş",
            value: orderCount,
            icon: <FaShoppingBag className="text-lg" />,
            color: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            id: 2,
            title: "Sepetteki Ürün",
            value: cartCount,
            icon: <FaChartLine className="text-lg" />,
            color: "bg-green-50",
            textColor: "text-green-600"
        },
        {
            id: 3,
            title: "Son Sipariş",
            value: formatLastOrderDate(lastOrderDate),
            icon: <FaRegClock className="text-lg" />,
            color: "bg-purple-50",
            textColor: "text-purple-600"
        }
    ];

    return (
        <div className="grid lg:grid-cols-7 gap-4 mb-16">
            {/* Sol Taraf - Karşılama Kartı */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-4 bg-gradient-to-br from-primary/10 via-primary/5 to-purple-50 rounded-2xl p-5 sm:p-6"
            >
                <div className="relative overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6 relative z-10"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg"
                            >
                                <motion.span 
                                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-2xl"
                                >
                                    👋
                                </motion.span>
                            </motion.div>
                            
                            <div className="flex-1">
                                <motion.h2 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text"
                                >
                                    Hoş Geldin, {user.firstName}!
                                </motion.h2>
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-gray-600 text-sm sm:text-base lg:text-lg mt-2 leading-relaxed"
                                >
                                    Sosyal medya hesaplarını 
                                    <motion.span 
                                        whileHover={{ scale: 1.05 }}
                                        className="text-primary font-semibold mx-1"
                                    >
                                        güçlendirmek
                                    </motion.span> 
                                    için doğru yerdesin! 
                                    <motion.span 
                                        whileHover={{ scale: 1.05 }}
                                        className="text-primary font-semibold mx-1"
                                    >
                                        Instagram takipçileri
                                    </motion.span> 
                                    ve 
                                    <motion.span 
                                        whileHover={{ scale: 1.05 }}
                                        className="text-primary font-semibold mx-1"
                                    >
                                        TikTok etkileşimleri
                                    </motion.span> 
                                    ile hesaplarının potansiyelini ortaya çıkar.
                                </motion.p>
                            </div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/dashboard/products')}
                                className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-3 rounded-xl font-medium text-sm sm:text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                            >
                                🚀 Hizmetleri Keşfet
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/dashboard/orders')}
                                className="flex-1 bg-white text-gray-700 px-8 py-3 rounded-xl font-medium text-sm sm:text-base shadow-lg hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
                            >
                                📦 Siparişlerim
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Dekoratif arka plan elementleri */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -z-10" />
                </div>
            </motion.div>

            {/* Sağ Taraf - İstatistikler */}
            <div className="lg:col-span-3 flex flex-col gap-3">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <div className={stat.textColor}>{stat.icon}</div>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
} 