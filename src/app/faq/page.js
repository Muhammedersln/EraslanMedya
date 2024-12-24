"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/Footer';
import { MdSearch, MdExpandMore, MdOutlineQuestionAnswer, MdOutlineCategory } from 'react-icons/md';

const FAQ_CATEGORIES = [
    {
        id: 'general',
        title: 'Genel Sorular',
        icon: '🌟',
        description: 'Sık sorulan genel sorular ve cevapları',
        questions: [
            {
                question: 'Siparişim ne zaman tamamlanacak?',
                answer: 'Siparişler genellikle 24 saat içerisinde tamamlanır. Yoğunluk durumuna göre bu süre değişebilir.'
            },
            {
                question: 'Ödeme yaptım ama sipariş oluşmadı, ne yapmalıyım?',
                answer: 'Endişelenmeyin! Ödemeniz başarıyla alındıysa, destek ekibimiz en kısa sürede size yardımcı olacaktır.'
            },
            {
                question: 'Siparişimi iptal edebilir miyim?',
                answer: 'İşleme alınmış siparişleri iptal edemezsiniz.'
            },
            {
                question: 'Siparişimin durumunu nasıl takip edebilirim?',
                answer: 'Siparişlerinizi hesabınızdan "Siparişlerim" bölümünden takip edebilirsiniz. Ayrıca size e-posta ile bilgilendirme yapılacaktır.'
            },
            {
                question: 'Ne kadar sürede destek alabilirim?',
                answer: 'Destek ekibimiz 7/24 canlı destek hizmeti sunmaktadır. Siparişleriniz hakkında herhangi bir sorunuz varsa, lütfen destek ekibimizle iletişime geçin.'
            }
        ]
    },
    {
        id: 'orders',
        title: 'Siparişler',
        icon: '📦',
        description: 'Sipariş süreçleri hakkında bilgiler',
        questions: [
            {
                question: 'Siparişimi iptal edebilir miyim?',
                answer: 'İşleme alınmış siparişleri iptal edemezsiniz.'
            },
            {
                question: 'Siparişimin durumunu nasıl takip edebilirim?',
                answer: 'Siparişlerinizi hesabınızdan "Siparişlerim" bölümünden takip edebilirsiniz. Ayrıca size e-posta ile bilgilendirme yapılacaktır.'
            },
            {
                question: 'Hesabım gizli ise takipçi gelir mi ?',
                answer: 'Hesabınız gizli ise takipçi gelmez.'
            },
            {
                question: 'Beğeniyi kaç gönderiye bölebilirim ?',
                answer: 'Beğeniyi 10 gönderiye bölebilirsiniz.'
            }
        ]
    },
    {
        id: 'payment',
        title: 'Ödeme',
        icon: '💳',
        description: 'Ödeme seçenekleri ve güvenlik',
        questions: [
            {
                question: 'Hangi ödeme yöntemlerini kullanabilirim?',
                answer: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Tüm ödemeleriniz SSL ile güvence altındadır.'
            },
            {
                question: 'Ödeme yaptım ama sipariş oluşmadı, ne yapmalıyım?',
                answer: 'Endişelenmeyin! Ödemeniz başarıyla alındıysa, destek ekibimiz en kısa sürede size yardımcı olacaktır.'
            }
        ]
    },
    {
        id: 'security',
        title: 'Güvenlik',
        icon: '🔒',
        description: 'Hesap ve veri güvenliği',
        questions: [
            {
                question: 'Kişisel verilerim güvende mi?',
                answer: 'Evet, kişisel verileriniz KVKK kapsamında korunmaktadır ve üçüncü taraflarla paylaşılmamaktadır.'
            },
            {
                question: 'Şifremi unuttum, ne yapmalıyım?',
                answer: 'Giriş sayfasındaki "Şifremi Unuttum" bağlantısını kullanarak şifrenizi sıfırlayabilirsiniz.'
            }
        ]
    }
];

export default function FAQ() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [expandedQuestions, setExpandedQuestions] = useState({});

    const toggleQuestion = (categoryId, questionIndex) => {
        const key = `${categoryId}-${questionIndex}`;
        setExpandedQuestions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const filteredCategories = FAQ_CATEGORIES.map(category => ({
        ...category,
        questions: category.questions.filter(
            q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            <main className="container mx-auto px-4 py-8 mt-16 max-w-7xl">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-8 sm:p-12 mb-12">
                    <div className="absolute inset-0 bg-grid-white/10" />
                    <div className="relative">
                        <div className="flex flex-col items-center text-center">
                            <MdOutlineQuestionAnswer className="w-16 h-16 text-white/90 mb-6" />
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                                Size Nasıl Yardımcı Olabiliriz?
                            </h1>
                            <p className="text-lg text-white/90 max-w-2xl">
                                Sıkça sorulan sorular ve cevaplarını burada bulabilirsiniz.
                                Aradığınız cevabı bulamazsanız, destek ekibimizle iletişime geçebilirsiniz.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mt-8">
                            <div className="relative">
                                <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                                <input
                                    type="text"
                                    placeholder="Soru veya cevap ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all backdrop-blur-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Grid */}
                {!searchQuery && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                        {FAQ_CATEGORIES.map((category) => (
                            <motion.button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`p-6 rounded-2xl text-left transition-all ${selectedCategory === category.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-white hover:bg-gray-50 text-gray-900'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="text-3xl mb-3 block">{category.icon}</span>
                                <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                                <p className={`text-sm ${selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                                    }`}>
                                    {category.description}
                                </p>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* FAQ Content */}
                <div className="grid gap-6 max-w-4xl mx-auto">
                    {(searchQuery ? filteredCategories : FAQ_CATEGORIES).map((category) => (
                        <AnimatePresence key={category.id}>
                            {(searchQuery || selectedCategory === category.id) && category.questions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {searchQuery && (
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <span>{category.icon}</span>
                                                {category.title}
                                            </h3>
                                        </div>
                                    )}

                                    <div className="divide-y divide-gray-100">
                                        {category.questions.map((item, index) => {
                                            const key = `${category.id}-${index}`;
                                            const isExpanded = expandedQuestions[key];

                                            return (
                                                <div key={index} className="overflow-hidden">
                                                    <motion.button
                                                        onClick={() => toggleQuestion(category.id, index)}
                                                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors"
                                                        whileHover={{ x: 4 }}
                                                        whileTap={{ scale: 0.995 }}
                                                    >
                                                        <span className="font-medium text-gray-900 pr-8">{item.question}</span>
                                                        <motion.div
                                                            initial={false}
                                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        >
                                                            <MdExpandMore className="w-6 h-6 text-gray-400" />
                                                        </motion.div>
                                                    </motion.button>

                                                    <motion.div
                                                        initial={false}
                                                        animate={{
                                                            height: isExpanded ? "auto" : 0,
                                                            opacity: isExpanded ? 1 : 0
                                                        }}
                                                        transition={{
                                                            height: { duration: 0.3, ease: "easeInOut" },
                                                            opacity: { duration: 0.2, ease: "easeInOut" }
                                                        }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-6 pb-4 pt-2 bg-gray-50/50">
                                                            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ))}
                </div>

                {/* Contact Support Section */}
                <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 sm:p-12">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <div className="relative text-center">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            Aradığınız cevabı bulamadınız mı?
                        </h3>
                        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                            test test test test
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.a
                                href="/contact"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-colors font-medium"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                İletişime Geç
                            </motion.a>
                            <motion.a
                                href="/dashboard/support"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors font-medium border border-gray-700"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Destek Talebi Oluştur
                            </motion.a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
} 