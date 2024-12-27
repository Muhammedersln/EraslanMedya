import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    // Admin yetkisi kontrolü
    const admin = await adminAuth(request);
    if (!admin) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 });
    }

    await dbConnect();

    // URL'den user ID'yi al
    const userId = request.url.split('/users/')[1].split('/resend-verification')[0];

    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ message: 'Bu hesap zaten doğrulanmış' }, { status: 400 });
    }

    // Yeni doğrulama e-postası gönder
    await sendVerificationEmail(user);

    return NextResponse.json({ message: 'Doğrulama e-postası başarıyla gönderildi' });
  } catch (error) {
    console.error('Doğrulama e-postası gönderme hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu' }, { status: 500 });
  }
} 