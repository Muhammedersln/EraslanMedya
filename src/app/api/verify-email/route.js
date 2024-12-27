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
    const decodedEmail = decodeURIComponent(email).toLowerCase();
    const cleanToken = token.trim(); // Don't decode the token as it's a hex string

    console.log('Verification attempt:', {
      email: decodedEmail,
      tokenLength: cleanToken.length
    });

    // Find user with matching token and email
    const user = await User.findOne({
      email: decodedEmail
    });

    if (!user) {
      console.log('User not found:', { email: decodedEmail });
      return NextResponse.redirect(new URL('/verify-email?error=expired', request.url));
    }

    console.log('User found, comparing tokens:', {
      providedToken: cleanToken,
      storedToken: user.verificationToken,
      isEmailVerified: user.isEmailVerified
    });

    if (user.isEmailVerified) {
      return NextResponse.redirect(new URL('/verify-email?error=already-verified', request.url));
    }

    if (!user.verificationToken || user.verificationToken !== cleanToken) {
      console.log('Token mismatch:', {
        providedToken: cleanToken,
        storedToken: user.verificationToken
      });
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url));
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