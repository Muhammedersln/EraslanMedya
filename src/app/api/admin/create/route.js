import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function POST() {
  try {
    await connectDB();

    // Admin bilgileri
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@eraslanmedya.com',
      phone: '5555555555',
      username: 'admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin'
    };

    // Eğer admin kullanıcısı varsa güncelle, yoksa oluştur
    const admin = await User.findOneAndUpdate(
      { username: adminData.username },
      adminData,
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: 'Admin kullanıcısı oluşturuldu',
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    return NextResponse.json({
      message: 'Admin oluşturulurken bir hata oluştu',
      error: error.message
    }, { status: 500 });
  }
} 