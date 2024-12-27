import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

// SendGrid API anahtarını ayarla
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    // Admin yetkisi kontrolü
    const admin = await adminAuth(request);
    if (!admin) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 });
    }

    await dbConnect();

    // URL'den user ID'yi al
    const userId = request.url.split('/users/')[1].split('/resend-verification')[0];

    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ message: 'Bu hesap zaten doğrulanmış' }, { status: 400 });
    }

    // Yeni doğrulama token'ı oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Doğrulama linki oluştur
    const verificationLink = `https://eraslanmedya.com.tr/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    // Email gönderme
    try {
      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Eraslan Medya'
        },
        subject: 'E-posta Adresinizi Doğrulayın - Eraslan Medya',
        text: `Eraslan Medya'ya hoş geldiniz! Hesabınızı doğrulamak için şu bağlantıyı kullanın: ${verificationLink}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>E-posta Doğrulama</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9fafb;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f9fafb">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; margin: 0 auto;">
                    <tr>
                      <td align="center" style="padding-bottom: 32px;">
                        <img src="https://eraslanmedya.com.tr/images/logo.png" alt="Eraslan Medya Logo" style="width: 180px; height: auto;">
                      </td>
                    </tr>
                    
                    <tr>
                      <td bgcolor="#ffffff" style="padding: 48px 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td>
                              <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #111827; text-align: center;">
                                E-posta Adresinizi Doğrulayın
                              </h1>
                              
                              <p style="margin: 0 0 32px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
                                Eraslan Medya'ya hoş geldiniz! Hesabınızı aktifleştirmek ve tüm özelliklere erişim sağlamak için lütfen e-posta adresinizi doğrulayın.
                              </p>
                              
                              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                  <td align="center" style="padding: 32px 0;">
                                    <a href="${verificationLink}" 
                                       style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; 
                                              color: #ffffff; background: linear-gradient(135deg, #4F46E5, #6366F1); 
                                              text-decoration: none; border-radius: 12px;
                                              box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                                      Hesabımı Doğrula
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              
                              <div style="margin: 32px 0 0; padding: 24px; background-color: #f9fafb; border-radius: 12px;">
                                <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">
                                  Butona tıklayamıyor musunuz? Aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #9ca3af; word-break: break-all;">
                                  ${verificationLink}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 32px 20px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="text-align: center;">
                              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                © ${new Date().getFullYear()} Eraslan Medya. Tüm hakları saklıdır.
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

      const response = await sgMail.send(msg);
      console.log('SendGrid Response:', response);
      
      return NextResponse.json({
        success: true,
        message: 'Doğrulama e-postası gönderildi.',
        response: response[0]?.statusCode
      });
    } catch (sendError) {
      console.error('SendGrid Error:', {
        message: sendError.message,
        response: sendError.response?.body
      });
      throw sendError;
    }
  } catch (error) {
    console.error('Doğrulama e-postası gönderme hatası:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Bir hata oluştu',
      error: error.message
    }, { status: 500 });
  }
} 