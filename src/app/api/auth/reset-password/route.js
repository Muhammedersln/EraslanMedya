import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token ve yeni şifre gereklidir.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Token ile kullanıcıyı bul
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' },
        { status: 400 }
      );
    }

    // Son şifre değişikliğinden bu yana 24 saat geçmiş mi kontrol et
    const lastPasswordReset = user.resetPasswordExpires ? new Date(user.resetPasswordExpires).getTime() - 3600000 : 0;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (Date.now() - lastPasswordReset < twentyFourHours) {
      return NextResponse.json(
        { error: 'Şifrenizi 24 saat içinde tekrar değiştiremezsiniz.' },
        { status: 400 }
      );
    }

    // Eski şifre ile aynı olup olmadığını kontrol et
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Yeni şifreniz eski şifrenizle aynı olamaz.' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Şifreyi güncelle ve tokenleri temizle
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'Şifreniz başarıyla güncellendi.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 