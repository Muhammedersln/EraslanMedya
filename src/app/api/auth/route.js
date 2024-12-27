import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { auth } from '@/lib/middleware/auth';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// SendGrid API key yapılandırması
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// JWT secret'ı Uint8Array'e çevir
const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');

// Get current user endpoint
export async function GET(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Login endpoint
export async function POST(request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }

    // E-posta doğrulaması kontrolü (admin hesapları hariç)
    if (user.role !== 'admin' && !user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Lütfen önce e-posta adresinizi doğrulayın', requiresVerification: true },
        { status: 403 }
      );
    }

    // Token oluştur (jose kütüphanesi ile)
    const token = await new SignJWT({ 
      id: user._id.toString(), 
      role: user.role,
      username: user.username 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    // Kullanıcı bilgilerini döndür
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    const response = NextResponse.json({ token, user: userResponse });
    
    // Token'ı cookie olarak ayarla
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    // Admin için ek header ekle
    if (user.role === 'admin') {
      response.headers.set('Authorization', `Bearer ${token}`);
      response.headers.set('x-auth-token', token);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: 'Giriş yapılırken bir hata oluştu', error: error.message },
      { status: 500 }
    );
  }
}

// Register endpoint
export async function PUT(request) {
  try {
    await dbConnect();
    const {
      firstName,
      lastName,
      email,
      phone,
      username,
      password
    } = await request.json();

    // Validate required fields
    if (!email || !username || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { message: 'Tüm alanları doldurunuz' },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { message: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
      if (existingUser.username === username.toLowerCase()) {
        return NextResponse.json(
          { message: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      username: username.toLowerCase(),
      password,
      verificationToken,
      isEmailVerified: false
    });

    await user.save();

    // Send verification email using SendGrid
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://eraslanmedya.com.tr' 
        : process.env.NEXT_PUBLIC_APP_URL;
        
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${email}`;

      // Merkezi email gönderme API'sini kullan
      const emailResponse = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: verificationToken,
          verificationLink: verificationUrl
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Email sending failed');
      }
    } catch (emailError) {
      console.error('SendGrid error:', emailError);
      // Delete the user if email sending fails
      await User.findByIdAndDelete(user._id);
      return NextResponse.json(
        { message: 'Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Kayıt işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Verify email endpoint
export async function PATCH(request) {
  try {
    await dbConnect();
    const { token, email } = await request.json();

    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationToken: token
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz doğrulama kodu' },
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return NextResponse.json({
      message: 'E-posta adresiniz başarıyla doğrulandı'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Doğrulama işlemi sırasında bir hata oluştu', error: error.message },
      { status: 500 }
    );
  }
}

// Reset password endpoint
export async function DELETE(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    // Send password reset email using SendGrid
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Şifrenizi Sıfırlayın',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Şifrenizi Sıfırlayın</h1>
            <p style="color: #666;">Merhaba ${user.firstName},</p>
            <p style="color: #666;">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Şifremi Sıfırla
              </a>
            </div>
            <p style="color: #666;">Veya aşağıdaki linki tarayıcınıza kopyalayabilirsiniz:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p style="color: #666;">Bu link 1 saat içinde geçerliliğini yitirecektir.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Bu e-posta şifrenizi sıfırlamak için gönderilmiştir.
              Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
            </p>
          </div>
        `
      };

      await sgMail.send(msg);
    } catch (emailError) {
      console.error('SendGrid error:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return NextResponse.json(
        { message: 'Şifre sıfırlama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu', error: error.message },
      { status: 500 }
    );
  }
} 