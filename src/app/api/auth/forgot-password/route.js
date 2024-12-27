import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { sendPasswordResetEmail } from '@/lib/utils/sendEmail';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    // E-posta ile kullanıcıyı bul
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    // Şifre sıfırlama tokeni oluştur
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Şifre sıfırlama e-postası gönder
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(
      { message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 