import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url));
    }

    await dbConnect();

    // Find user with matching token and email
    const user = await User.findOne({
      email: decodeURIComponent(email).toLowerCase(),
      verificationToken: token
    });

    if (!user) {
      return NextResponse.redirect(new URL('/verify-email?error=expired', request.url));
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return NextResponse.redirect(new URL('/verify-email?success=true', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/verify-email?error=server', request.url));
  }
}