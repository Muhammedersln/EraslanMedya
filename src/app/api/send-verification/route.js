import sgMail from '@sendgrid/mail';
import { NextResponse } from 'next/server';

// SendGrid API anahtarını ayarla
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    const { email, token, verificationLink } = await request.json();
    
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL is not defined');
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not defined');
    }

    // Modern ve spam skorunu düşürecek şablon
    const msg = {
      to: email,
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
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; background-color: #f9fafb;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f9fafb">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; margin: 0 auto;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 0 20px;">
                      <img src="https://eraslanmedya.com/logo.png" alt="Eraslan Medya Logo" style="width: 180px; height: auto; margin-bottom: 30px;">
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td bgcolor="#ffffff" style="padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #111827; text-align: center;">
                              E-posta Adresinizi Doğrulayın
                            </h1>
                            
                            <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; text-align: center;">
                              Eraslan Medya'ya hoş geldiniz! Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın.
                            </p>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="center" style="padding: 30px 0;">
                                  <a href="${verificationLink}" 
                                     style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; 
                                            color: #ffffff; background: linear-gradient(to right, #4F46E5, #6366F1); 
                                            text-decoration: none; border-radius: 8px;
                                            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                                    Hesabımı Doğrula
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280; text-align: center;">
                              Bu bağlantı 24 saat boyunca geçerlidir. Eğer butona tıklayamıyorsanız, aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:
                            </p>
                            
                            <p style="margin: 0 0 24px; font-size: 12px; color: #9ca3af; word-break: break-all; text-align: center;">
                              ${verificationLink}
                            </p>
                            
                            <div style="margin: 40px 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                                Bu e-postayı talep etmediyseniz, güvenle görmezden gelebilirsiniz.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 20px;">
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
      `,
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      },
      trackingSettings: {
        clickTracking: {
          enable: true
        },
        openTracking: {
          enable: true
        }
      }
    };

    try {
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
    console.error('Error:', error.message);
    
    return NextResponse.json({
      success: false,
      message: 'E-posta gönderilemedi.',
      error: error.message
    }, { status: 500 });
  }
} 