import React from 'react';

const services = [
  {
    platform: 'Instagram',
    description: 'Organik ve kalıcı Instagram hizmetleri',
    services: [
      { name: 'Türk Takipçi', icon: '👥' },
      { name: 'Gerçek Beğeni', icon: '❤️' },
      { name: 'Video İzlenme', icon: '👁️' },
      { name: 'Reels İzlenme', icon: '📱' },
    ],
    icon: '📸',
  },
  {
    platform: 'TikTok',
    description: 'Viral TikTok içerikleri için hizmetler',
    services: [
      { name: 'Global Takipçi', icon: '🌍' },
      { name: 'Video Beğeni', icon: '💖' },
      { name: 'Video İzlenme', icon: '📺' },
      { name: 'Canlı Yayın', icon: '🎥' },
    ],
    icon: '🎵',
  },
  {
    platform: 'YouTube',
    description: 'YouTube kanalınızı büyütün',
    services: [
      { name: 'Abone Artışı', icon: '📢' },
      { name: 'Video İzlenme', icon: '▶️' },
      { name: 'Video Beğeni', icon: '👍' },
      { name: 'Yorum', icon: '💭' },
    ],
    icon: '▶️',
  }
];

const Services = () => {
  return (
    <div className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-4 text-primary">Hizmetlerimiz</h2>
        <p className="text-text-light text-center mb-12 max-w-2xl mx-auto">
          Sosyal medya hesaplarınızı büyütmek için ihtiyacınız olan tüm hizmetler
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((platform) => (
            <div 
              key={platform.platform} 
              className="bg-background-light rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-secondary/10"
            >
              <div className="bg-accent p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{platform.icon}</span>
                    <h3 className="text-xl font-semibold">{platform.platform}</h3>
                  </div>
                  <p className="text-white/90 text-sm">{platform.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-dark to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {platform.services.map((service) => (
                    <div 
                      key={service.name}
                      className="flex items-center gap-2 p-3 rounded-lg bg-background hover:bg-background-dark transition-colors"
                    >
                      <span className="text-xl">{service.icon}</span>
                      <span className="text-sm font-medium text-text">{service.name}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 bg-accent text-white py-3 rounded-lg hover:bg-accent-dark transition-colors font-medium">
                  Detaylı Bilgi
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services; 