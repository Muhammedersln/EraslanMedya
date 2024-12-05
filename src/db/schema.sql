-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alt kategoriler tablosu
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ürünler tablosu
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Örnek veriler
INSERT INTO categories (name, icon) VALUES
  ('Instagram', '📸'),
  ('TikTok', '🎵');

INSERT INTO subcategories (category_id, name, icon) VALUES
  (1, 'Takipçi', '👥'),
  (1, 'Beğeni', '❤️'),
  (1, 'İzlenme', '👁️'),
  (2, 'Takipçi', '👥'),
  (2, 'Beğeni', '❤️'),
  (2, 'İzlenme', '👁️');

-- Örnek ürünler
INSERT INTO products (category_id, subcategory_id, name, description, price, image_url) VALUES
  (1, 1, '1000 Türk Takipçi', 'Gerçek ve Türk hesaplardan oluşan takipçi paketi', 29.99, '/images/products/instagram-followers.jpg'),
  (1, 2, '2000 Beğeni', 'Kalıcı beğeni garantisi', 39.99, '/images/products/instagram-likes.jpg'),
  (1, 3, '5000 Reels İzlenme', 'Reels videolarınız için organik izlenme', 19.99, '/images/products/instagram-views.jpg'),
  (2, 4, '1000 TikTok Takipçi', 'Global takipçi paketi', 34.99, '/images/products/tiktok-followers.jpg'),
  (2, 5, '2000 TikTok Beğeni', 'Video beğeni paketi', 29.99, '/images/products/tiktok-likes.jpg'),
  (2, 6, '5000 TikTok İzlenme', 'Video izlenme paketi', 24.99, '/images/products/tiktok-views.jpg'); 