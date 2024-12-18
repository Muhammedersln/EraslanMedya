import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { auth } from '@/lib/middleware/auth';

export async function PUT(request) {
  try {
    await dbConnect();
    const user = await auth(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { firstName, lastName, email, phone } = await request.json();

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { message: 'Tüm alanları doldurunuz' },
        { status: 400 }
      );
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: user.id }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Return updated user data without sensitive information
    const userResponse = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      username: updatedUser.username,
      role: updatedUser.role,
      isEmailVerified: updatedUser.isEmailVerified
    };

    return NextResponse.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: userResponse
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Profil güncelleme işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 