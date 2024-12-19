import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Form validasyonu
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurunuz' },
        { status: 400 }
      );
    }

    // Kullanıcıya otomatik yanıt e-postası
    const userMsg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Mesajınız Alındı ✓ - Eraslan Medya',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Mesajınız Bize Ulaştı ✓</h1>
            <p style="font-size: 16px; color: #666;">En kısa sürede size dönüş yapacağız.</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Gönderdiğiniz Mesaj:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">İsim:</td>
                <td style="padding: 8px 0;"><strong>${name}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">E-posta:</td>
                <td style="padding: 8px 0;"><strong>${email}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Konu:</td>
                <td style="padding: 8px 0;"><strong>${subject}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Mesaj:</td>
                <td style="padding: 8px 0;"><strong>${message}</strong></td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
            <p style="margin-bottom: 10px; color: #666;">Bizi tercih ettiğiniz için teşekkür ederiz.</p>
            <div style="margin-top: 20px;">
              <p style="font-size: 14px; color: #94a3b8;">Eraslan Medya</p>
              <p style="font-size: 14px; color: #94a3b8;">İstanbul, Türkiye</p>
              <p style="font-size: 14px; color: #94a3b8;">
                <a href="tel:+905439302395" style="color: #2563eb; text-decoration: none;">+90 543 930 23 95</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Mesajınız Bize Ulaştı ✓

Sayın ${name},

Mesajınız başarıyla alınmıştır. En kısa sürede size dönüş yapacağız.

Gönderdiğiniz Mesaj:
İsim: ${name}
E-posta: ${email}
Konu: ${subject}
Mesaj: ${message}

Bizi tercih ettiğiniz için teşekkür ederiz.

Eraslan Medya
İstanbul, Türkiye
Tel: +90 543 930 23 95
      `
    };

    // Yöneticiye bildirim e-postası
    const adminMsg = {
      to: 'eraslanmuhammed924@gmail.com', // Yönetici e-postası
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `İletişim Formu: ${subject}`,
      html: `
        <h2>Yeni İletişim Formu Mesajı</h2>
        <p><strong>Gönderen:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Konu:</strong> ${subject}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message}</p>
      `,
    };

    // Her iki e-postayı da gönder
    await Promise.all([
      sgMail.send(adminMsg),
      sgMail.send(userMsg)
    ]);

    return NextResponse.json(
      { message: 'E-posta başarıyla gönderildi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('SendGrid Hatası:', error);
    return NextResponse.json(
      { error: 'E-posta gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 