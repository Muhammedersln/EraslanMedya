import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { auth } from '@/lib/middleware/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme başarısız' },
        { status: 401 }
      );
    }

    // Veritabanı bağlantısı
    await dbConnect();

    // Request body'den verileri al
    const { currentPassword, newPassword } = await request.json();

    // Kullanıcıyı bul (şifre ile birlikte)
    const userWithPassword = await User.findById(user._id);
    if (!userWithPassword) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Mevcut şifreyi kontrol et
    const isPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hashle ve güncelle
    userWithPassword.password = newPassword; // Model içindeki pre-save hook şifreyi hashleyecek
    userWithPassword.updatedAt = new Date();
    await userWithPassword.save();

    return NextResponse.json({
      message: 'Şifre başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    return NextResponse.json(
      { message: 'Şifre güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 