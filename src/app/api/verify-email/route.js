import { verifyToken } from '@/utils/token';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

    // Frontend'de token'ı doğrula
    const { valid, email: tokenEmail } = verifyToken(token);

    if (!valid || tokenEmail !== email) {
      return NextResponse.json(
        { message: 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.' },
        { status: 400 }
      );
    }

    try {
      // Backend API'ye istek at
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          token: token // Send the base64 token to backend
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Doğrulama işlemi başarısız oldu.');
      }

      const data = await response.json();
      return NextResponse.json(
        { message: 'E-posta başarıyla doğrulandı.' },
        { status: 200 }
      );
    } catch (apiError) {
      return NextResponse.json(
        { message: apiError.message || 'Doğrulama işlemi sırasında bir hata oluştu.' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// POST metodunu kaldırıyoruz çünkü kullanılmıyor 