import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { auth } from '@/lib/middleware/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const user = await auth(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Mevcut şifre ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }

    // Get user from database to verify password
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await dbUser.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // Update password
    dbUser.password = newPassword;
    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { message: 'Şifre değiştirme işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 