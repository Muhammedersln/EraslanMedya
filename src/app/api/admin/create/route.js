import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await dbConnect();
    console.log('MongoDB bağlantısı başarılı');
    console.log('Aktif veritabanı:', mongoose.connection.db.databaseName);

    // Admin bilgileri
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'info@eraslanmedya.com',
      phone: '05439302395',
      username: 'admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin'
    };

    console.log('Admin verisi hazırlandı:', { ...adminData, password: '[HIDDEN]' });
    console.log('Koleksiyon adı:', User.collection.name);
    console.log('Veritabanı adı:', User.collection.conn.db.databaseName);

    // Eğer admin kullanıcısı varsa güncelle, yoksa oluştur
    const admin = await User.findOneAndUpdate(
      { username: adminData.username },
      adminData,
      { upsert: true, new: true }
    );

    console.log('Admin başarıyla oluşturuldu/güncellendi');
    console.log('Kaydedilen veritabanı:', admin.collection.conn.db.databaseName);

    return NextResponse.json({
      message: 'Admin kullanıcısı oluşturuldu',
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
        database: admin.collection.conn.db.databaseName
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    return NextResponse.json({
      message: 'Admin oluşturulurken bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 