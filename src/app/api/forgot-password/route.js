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
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Şifre Sıfırlama</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; background-color: #f9fafb;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f9fafb">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; margin: 0 auto;">
                    <!-- Header with Logo -->
                    <tr>
                      <td align="center" style="padding-bottom: 32px;">
                        <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="Eraslan Medya Logo" style="width: 180px; height: auto;">
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td bgcolor="#ffffff" style="padding: 48px 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #111827; text-align: center;">
                                Şifrenizi Sıfırlayın
                              </h1>
                              
                              <p style="margin: 0 0 32px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
                                Merhaba ${user.firstName}, şifrenizi sıfırlamak için bir talepte bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
                              </p>
                              
                              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                  <td align="center" style="padding: 32px 0;">
                                    <a href="${resetUrl}" 
                                       style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; 
                                              color: #ffffff; background: linear-gradient(135deg, #4F46E5, #6366F1); 
                                              text-decoration: none; border-radius: 12px;
                                              box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                                      Şifremi Sıfırla
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              
                              <div style="margin: 32px 0 0; padding: 24px; background-color: #f9fafb; border-radius: 12px;">
                                <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">
                                  Butona tıklayamıyor musunuz? Aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #9ca3af; word-break: break-all;">
                                  ${resetUrl}
                                </p>
                              </div>
                              
                              <div style="margin: 32px 0 0; padding: 24px; background-color: #fff7ed; border-radius: 12px; border: 1px solid #fed7aa;">
                                <p style="margin: 0; font-size: 14px; color: #9a3412; text-align: center;">
                                  ⚠️ Bu bağlantı güvenliğiniz için 1 saat içinde geçerliliğini yitirecektir.
                                </p>
                              </div>
                              
                              <div style="margin: 32px 0 0; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                                  Bu işlemi siz yapmadıysanız, lütfen bu e-postayı görmezden gelin ve hesabınızın güvenliğini kontrol edin.
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 32px 20px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="text-align: center;">
                              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                                © ${new Date().getFullYear()} Eraslan Medya. Tüm hakları saklıdır.
                              </p>
                              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                Bu e-posta Eraslan Medya tarafından gönderilmiştir.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
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