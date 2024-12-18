import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token gereklidir' },
        { status: 400 }
      );
    }

    // Find user with valid reset token and not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token geçerli'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Token doğrulama işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 