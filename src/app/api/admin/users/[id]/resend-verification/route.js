import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { sendVerificationEmail } from '@/lib/utils/sendEmail';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;

    // Kullanıcıyı bul
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Bu kullanıcının e-posta adresi zaten doğrulanmış.' },
        { status: 400 }
      );
    }

    // Yeni doğrulama tokeni oluştur
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Doğrulama e-postasını yeniden gönder
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json(
      { message: 'Doğrulama e-postası başarıyla yeniden gönderildi.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend Verification Email Error:', error);
    return NextResponse.json(
      { error: 'E-posta gönderimi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 