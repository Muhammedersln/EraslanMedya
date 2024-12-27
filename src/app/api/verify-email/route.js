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

    // Decode email and clean token
    const decodedEmail = decodeURIComponent(email).toLowerCase();
    const cleanToken = decodeURIComponent(token).trim();

    // Find user with matching token and email
    const user = await User.findOne({
      email: decodedEmail,
      verificationToken: cleanToken
    });

    if (!user) {
      console.log('User not found or invalid token:', { email: decodedEmail });
      return NextResponse.redirect(new URL('/verify-email?error=expired', request.url));
    }

    if (user.isEmailVerified) {
      return NextResponse.redirect(new URL('/verify-email?error=already-verified', request.url));
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to success page
    const successUrl = new URL('/verify-email?success=true', request.url);
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/verify-email?error=server', request.url));
  }
}