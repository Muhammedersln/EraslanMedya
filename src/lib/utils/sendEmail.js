import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailTemplate = (content) => `
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
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="Logo" style="width: 180px; height: auto;">
            </td>
          </tr>
          
          <tr>
            <td bgcolor="#ffffff" style="padding: 48px 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              ${content}
            </td>
          </tr>
          
          <tr>
            <td style="padding: 32px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      © ${new Date().getFullYear()} Tüm hakları saklıdır.
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
`;

export const sendVerificationEmail = async (to, verificationToken) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
  
  const content = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #111827; text-align: center;">
            E-posta Adresinizi Doğrulayın
          </h1>
          
          <p style="margin: 0 0 32px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
            Hesabınızı aktifleştirmek ve tüm özelliklere erişim sağlamak için lütfen e-posta adresinizi doğrulayın.
          </p>
          
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding: 32px 0;">
                <a href="${verificationUrl}" 
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
              ${verificationUrl}
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'E-posta Adresinizi Doğrulayın',
    html: emailTemplate(content),
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid Error:', error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  const content = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #111827; text-align: center;">
            Şifre Sıfırlama
          </h1>
          
          <p style="margin: 0 0 32px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
            Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Bu bağlantı güvenliğiniz için 1 saat süreyle geçerlidir.
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
          
          <div style="margin: 32px 0 0; padding: 24px; background-color: #fee2e2; border-radius: 12px;">
            <p style="margin: 0; font-size: 14px; color: #991b1b;">
              Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın ve hesabınızın güvenliği için şifrenizi değiştirmeyi düşünün.
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Şifre Sıfırlama',
    html: emailTemplate(content),
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid Error:', error);
    return { success: false, error: error.message };
  }
};

export const sendOrderNotificationEmail = async (order, userInfo) => {
  const adminEmail = 'muhammed.ersln@icloud.com';
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order._id}`;
  
  // Format items for email display
  const itemsList = order.items.map(item => {
    const productName = item.product?.name || 'Ürün';
    const quantity = item.quantity || 1;
    const price = (item.price || 0).toFixed(2);
    const totalPrice = (item.price * item.quantity || 0).toFixed(2);
    
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 16px; color: #111827;">${productName}</p>
          ${item.productData ? `<p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">${JSON.stringify(item.productData)}</p>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #374151;">${quantity}</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <p style="margin: 0; font-size: 14px; color: #374151;">₺${price}</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <p style="margin: 0; font-size: 14px; color: #374151;">₺${totalPrice}</p>
        </td>
      </tr>
    `;
  }).join('');

  const content = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #111827; text-align: center;">
            Yeni Sipariş Alındı!
          </h1>
          
          <div style="margin: 0 0 32px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827;">
              Sipariş Detayları:
            </p>
            <p style="margin: 0 0 4px; font-size: 14px; color: #4b5563;">
              <strong>Sipariş ID:</strong> ${order._id}
            </p>
            <p style="margin: 0 0 4px; font-size: 14px; color: #4b5563;">
              <strong>Tarih:</strong> ${new Date(order.createdAt).toLocaleString('tr-TR')}
            </p>
            <p style="margin: 0 0 4px; font-size: 14px; color: #4b5563;">
              <strong>Toplam Tutar:</strong> ₺${order.totalAmount.toFixed(2)}
            </p>
            <p style="margin: 0; font-size: 14px; color: #4b5563;">
              <strong>Ödeme Durumu:</strong> <span style="color: #047857; font-weight: 600;">Ödendi</span>
            </p>
          </div>
          
          <div style="margin: 0 0 32px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827;">
              Müşteri Bilgileri:
            </p>
            <p style="margin: 0 0 4px; font-size: 14px; color: #4b5563;">
              <strong>Müşteri:</strong> ${userInfo.name || 'İsimsiz'}
            </p>
            <p style="margin: 0; font-size: 14px; color: #4b5563;">
              <strong>E-posta:</strong> ${userInfo.email || 'Bilgi yok'}
            </p>
          </div>
          
          <div style="margin: 0 0 32px;">
            <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
              Sipariş Ürünleri:
            </p>
            
            <table width="100%" style="border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 12px 0; border-bottom: 2px solid #e5e7eb; text-align: left; font-size: 14px; color: #6b7280;">Ürün</th>
                  <th style="padding: 12px 0; border-bottom: 2px solid #e5e7eb; text-align: center; font-size: 14px; color: #6b7280;">Adet</th>
                  <th style="padding: 12px 0; border-bottom: 2px solid #e5e7eb; text-align: right; font-size: 14px; color: #6b7280;">Birim Fiyat</th>
                  <th style="padding: 12px 0; border-bottom: 2px solid #e5e7eb; text-align: right; font-size: 14px; color: #6b7280;">Toplam</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
                <tr>
                  <td colspan="3" style="padding: 16px 0; text-align: right; font-weight: 600; font-size: 16px; color: #111827;">
                    Genel Toplam:
                  </td>
                  <td style="padding: 16px 0; text-align: right; font-weight: 600; font-size: 16px; color: #111827;">
                    ₺${order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding: 32px 0;">
                <a href="${orderUrl}" 
                   style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; 
                          color: #ffffff; background: linear-gradient(135deg, #4F46E5, #6366F1); 
                          text-decoration: none; border-radius: 12px;
                          box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                  Siparişi Görüntüle
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const msg = {
    to: adminEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Yeni Sipariş Alındı! - Sipariş #' + order._id,
    html: emailTemplate(content),
  };

  try {
    await sgMail.send(msg);
    console.log('Order notification email sent to admin');
    return { success: true };
  } catch (error) {
    console.error('SendGrid Error:', error);
    return { success: false, error: error.message };
  }
}; 