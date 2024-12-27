import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { sendVerificationEmail } from '@/lib/utils/sendEmail';

export async function POST(request) {
  try {
    await connectDB();
    
    // Request body'den verileri al
    const body = await request.json();
    const { firstName, lastName, username, email, phone, password } = body;

    // Gerekli alanların kontrolü
    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Tüm alanların doldurulması zorunludur.' },
        { status: 400 }
      );
    }

    // E-posta formatı kontrolü
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    // Telefon numarası kontrolü
    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Geçerli bir telefon numarası giriniz (10 haneli).' },
        { status: 400 }
      );
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // E-posta veya kullanıcı adının kullanımda olup olmadığını kontrol et
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanımda.' },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanımda.' },
          { status: 400 }
        );
      }
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      password
    });

    // Doğrulama tokeni oluştur
    const verificationToken = user.generateVerificationToken();

    // Kullanıcıyı kaydet
    await user.save();

    // Doğrulama e-postası gönder
    const emailResult = await sendVerificationEmail(email, verificationToken);
    
    if (!emailResult.success) {
      // E-posta gönderilemezse kullanıcıyı sil
      await User.findByIdAndDelete(user._id);
      return NextResponse.json(
        { error: 'Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 