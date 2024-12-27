import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

// SendGrid API anahtarını ayarla
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // Yeni doğrulama token'ı oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Doğrulama linki oluştur
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://eraslanmedya.com.tr' 
      : process.env.NEXT_PUBLIC_APP_URL;
      
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}&email=${user.email}`;

    // Email gönderme
    try {
      const emailResponse = await fetch(`${baseUrl}/api/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          token: verificationToken,
          verificationLink: verificationLink
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Email sending failed');
      }

      const data = await emailResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Doğrulama e-postası gönderildi.',
        response: data
      });
    } catch (sendError) {
      console.error('SendGrid Error:', {
        message: sendError.message,
        response: sendError.response?.body
      });
      throw sendError;
    }
  } catch (error) {
    console.error('Doğrulama e-postası gönderme hatası:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Bir hata oluştu',
      error: error.message
    }, { status: 500 });
  }
} 