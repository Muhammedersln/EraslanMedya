import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { auth } from '@/lib/middleware/auth';

export async function PUT(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme başarısız' },
        { status: 401 }
      );
    }

    // Veritabanı bağlantısı
    await dbConnect();

    // Request body'den verileri al
    const { firstName, lastName, email, phone } = await request.json();

    // Email kontrolü
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        firstName,
        lastName,
        email,
        phone,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { message: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 