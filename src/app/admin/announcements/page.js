"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AnnouncementsPage() {
  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    buttonText: "",
    buttonUrl: "",
    sendEmail: true
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Stats
  const [stats, setStats] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      return toast.error("Konu alanı zorunludur");
    }
    
    if (!formData.message.trim()) {
      return toast.error("Duyuru metni zorunludur");
    }
    
    // Buton URL'si varsa, buton metni zorunlu
    if (formData.buttonUrl && !formData.buttonText) {
      return toast.error("Buton URL'si ayarladığınızda buton metni zorunludur");
    }
    
    try {
      setIsLoading(true);
      toast.loading("Duyuru gönderiliyor...");
      
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      toast.dismiss(); // Loading toast'ını kapat
      
      if (!response.ok) {
        throw new Error(data.message || "Bir hata oluştu");
      }
      
      // İstatistikleri göster
      if (data.emailResults) {
        setStats(data.emailResults);
        toast.success(`Duyuru başarıyla gönderildi! (${data.emailResults.success} başarılı)`);
      } else {
        toast.success("Duyuru başarıyla kaydedildi");
      }
      
      // Formu sıfırla
      if (formData.sendEmail) {
        setFormData({
          subject: "",
          message: "",
          buttonText: "",
          buttonUrl: "",
          sendEmail: true
        });
      }
      
    } catch (error) {
      console.error("Duyuru gönderme hatası:", error);
      toast.error(error.message || "Duyuru gönderilirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Duyuru Oluştur</h1>
        <p className="text-gray-600">Tüm kullanıcılara duyuru gönder ve e-posta bilgilendirmesi yap.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Konu */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Duyuru Konusu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Duyuru konusu"
                required
              />
            </div>
            
            {/* Mesaj */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Duyuru Metni <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Duyuru metnini buraya yazın..."
                required
              ></textarea>
              <p className="mt-1 text-sm text-gray-500">Bu metin e-posta olarak gönderilecektir.</p>
            </div>
            
            {/* Buton Ayarları */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Buton Ayarları (İsteğe Bağlı)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-1">
                    Buton Metni
                  </label>
                  <input
                    type="text"
                    id="buttonText"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Örn: Siteyi Ziyaret Et"
                  />
                </div>
                <div>
                  <label htmlFor="buttonUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Buton URL
                  </label>
                  <input
                    type="url"
                    id="buttonUrl"
                    name="buttonUrl"
                    value={formData.buttonUrl}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            
            {/* E-posta Gönderme Seçeneği */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                name="sendEmail"
                checked={formData.sendEmail}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary rounded"
              />
              <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-700">
                Tüm kullanıcılara e-posta gönder
              </label>
            </div>
            
            {/* Gönderme Butonu */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  "Duyuruyu Gönder"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Sonuçlar */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Gönderim Sonuçları</h2>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <span className="font-semibold mr-1">{stats.success}</span> başarılı
            </div>
            
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <span className="font-semibold mr-1">{stats.failed}</span> başarısız
            </div>
            
            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg flex items-center">
              <span className="font-semibold mr-1">{stats.success + stats.failed}</span> toplam
            </div>
          </div>
          
          {stats.failed > 0 && stats.errors && stats.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Hata Detayları:</h3>
              <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded border border-gray-200">
                <ul className="text-sm text-gray-600 space-y-1">
                  {stats.errors.map((error, index) => (
                    <li key={index}>
                      <strong>{error.email}:</strong> {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 