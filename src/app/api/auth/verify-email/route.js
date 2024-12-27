import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    // URL'den token'ı al
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Doğrulama tokeni gereklidir.' },
        { status: 400 }
      );
    }

    // Token ile kullanıcıyı bul
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.' },
        { status: 400 }
      );
    }

    // Kullanıcıyı doğrulanmış olarak işaretle
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Başarılı yanıt döndür
    return NextResponse.json(
      { message: 'E-posta adresi başarıyla doğrulandı.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email Verification Error:', error);
    return NextResponse.json(
      { error: 'E-posta doğrulama işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// POST metodu için de aynı işlevi sağla
export async function POST(request) {
  try {
    await connectDB();
    
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Doğrulama tokeni gereklidir.' },
        { status: 400 }
      );
    }

    // Token ile kullanıcıyı bul
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.' },
        { status: 400 }
      );
    }

    // Kullanıcıyı doğrulanmış olarak işaretle
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'E-posta adresi başarıyla doğrulandı.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email Verification Error:', error);
    return NextResponse.json(
      { error: 'E-posta doğrulama işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 