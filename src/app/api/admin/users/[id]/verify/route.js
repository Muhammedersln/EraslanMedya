import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    // Admin yetkisi kontrolü
    const admin = await adminAuth(request);
    if (!admin) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 });
    }

    await dbConnect();

    // URL'den user ID'yi al
    const userId = request.url.split('/users/')[1].split('/verify')[0];

    // Kullanıcıyı bul ve güncelle
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    user.isEmailVerified = true;
    await user.save();

    return NextResponse.json({ message: 'Kullanıcı hesabı başarıyla doğrulandı' });
  } catch (error) {
    console.error('Kullanıcı doğrulama hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu' }, { status: 500 });
  }
} 