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

    // Şifreyi güncelle ve tokenleri temizle
    user.password = password; // Mongoose pre-save hook şifreyi otomatik hashleyecek
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