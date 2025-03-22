import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { auth } from '@/lib/middleware/auth';
import { sendAnnouncementEmail } from '@/lib/utils/sendEmail';

// Tüm kullanıcılara duyuru gönderme
export async function POST(request) {
  try {
    const user = await auth(request);
    


    await dbConnect();
    
    // Duyuru verileri
    const { subject, message, buttonText, buttonUrl, sendEmail } = await request.json();
    
    // Zorunlu alanlar
    if (!subject || !message) {
      return NextResponse.json(
        { message: 'Konu ve mesaj alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // E-posta göndermek isteniyorsa
    if (sendEmail) {
      try {
        // Tüm kullanıcıları bul - filtreleri kaldırdım
        const users = await User.find({}, 'email');
        console.log(`Bulunan kullanıcı sayısı: ${users.length}`);
        
        // Kullanıcı e-posta adresleri
        const recipients = users.map(user => user.email).filter(Boolean);
        console.log(`Geçerli e-posta adresi sayısı: ${recipients.length}`);
        
        // Test için admin e-postasını ekle
        recipients.push('muhammed.ersln@icloud.com');
        
        if (recipients.length === 0) {
          return NextResponse.json(
            { message: 'Gönderilecek kullanıcı bulunamadı' },
            { status: 400 }
          );
        }
        
        // E-postaları gönder
        const emailResults = await sendAnnouncementEmail(
          recipients,
          subject,
          message,
          buttonText || null,
          buttonUrl || null
        );
        
        return NextResponse.json({
          message: 'Duyuru başarıyla gönderildi',
          emailResults,
          recipientCount: recipients.length
        });
      } catch (dbError) {
        console.error('Kullanıcı verilerini çekme hatası:', dbError);
        return NextResponse.json(
          { message: 'Kullanıcı verileri alınırken hata oluştu', error: dbError.message },
          { status: 500 }
        );
      }
    }
    
    // E-posta göndermeden başarılı yanıt
    return NextResponse.json({
      message: 'Duyuru başarıyla kaydedildi',
      sendEmail: false
    });
    
  } catch (error) {
    console.error('Duyuru gönderme hatası:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası', error: error.message },
      { status: 500 }
    );
  }
} 