import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: 'eraslan_medya'
    };

    try {
      console.log('MongoDB bağlantısı başlatılıyor...');
      cached.promise = mongoose.connect(MONGODB_URI, opts);
      const conn = await cached.promise;
      console.log('MongoDB bağlantısı başarılı. Veritabanı:', conn.connection.db.databaseName);
    } catch (error) {
      console.error('MongoDB bağlantı hatası:', error);
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB bağlantı hatası:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect; 