import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// SendGrid API key yapılandırması
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'E-posta adresi gereklidir' },
        { status: 400 }
      );
    }

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
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Reset password with token
export async function PUT(request) {
  try {
    await dbConnect();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }

    // Find user with valid reset token and not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı' },
        { status: 400 }
      );
    }

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { message: 'Şifre güncelleme işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 