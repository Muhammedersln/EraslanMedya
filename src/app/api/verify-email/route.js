import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      console.log('Missing parameters:', { token: !!token, email: !!email });
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url));
    }

    await dbConnect();

    // Decode email and clean token
    const decodedEmail = decodeURIComponent(email).toLowerCase().trim();
    const cleanToken = token.trim();

    console.log('Verification attempt:', {
      email: decodedEmail,
      tokenLength: cleanToken.length
    });

    // Find user with matching email
    const user = await User.findOne({
      email: decodedEmail,
      verificationToken: cleanToken
    });

    if (!user) {
      console.log('User not found or token mismatch:', { email: decodedEmail });
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url));
    }

    console.log('User found:', {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      tokenMatch: user.verificationToken === cleanToken
    });

    if (user.isEmailVerified) {
      return NextResponse.redirect(new URL('/verify-email?error=already-verified', request.url));
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    console.log('Verification successful:', { email: decodedEmail });

    // Redirect to success page
    return NextResponse.redirect(new URL('/verify-email?success=true', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/verify-email?error=server', request.url));
  }
}