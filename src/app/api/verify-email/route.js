import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { message: 'Token ve email gereklidir.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user with matching token and email
    const user = await User.findOne({
      email: decodeURIComponent(email).toLowerCase(),
      verificationToken: token
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.' },
        { status: 400 }
      );
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'E-posta adresiniz başarıyla doğrulandı.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Doğrulama işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}