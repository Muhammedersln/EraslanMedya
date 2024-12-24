import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

// Token alma ve ödeme başlatma
export async function POST(request) {
  try {
    await dbConnect();
    
    // İsteğin content type'ını kontrol et
    const contentType = request.headers.get('content-type');
    
    // Eğer application/json ise, ödeme başlatma isteğidir
    if (contentType && contentType.includes('application/json')) {
      const { orderDetails, userInfo } = await request.json();

      // PayTR için gerekli parametreler
      const merchant_oid = orderDetails.id;
      const email = userInfo.email;
      const payment_amount = Math.floor(orderDetails.totalAmount * 100); // TL to kuruş
      const user_basket = JSON.stringify(orderDetails.items.map(item => [
        item.product?.name || 'Ürün',
        (item.price || 0).toFixed(2),
        item.quantity || 1
      ]));
      const user_name = userInfo.name || userInfo.email;
      const user_address = 'Digital Delivery';
      const user_phone = userInfo.phone || '05111111111';
      const merchant_ok_url = 'https://eraslanmedya.com/payment/success';
      const merchant_fail_url = 'https://eraslanmedya.com/payment/fail';
      const timeout_limit = '30';
      const debug_on = '1';
      const test_mode = "1";
      const no_installment = '0';
      const max_installment = '0';
      const currency = 'TL';
      const lang = 'tr';

      // Hash string oluşturma
      const hashStr = `${MERCHANT_ID}${userInfo.ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
      const paytr_token = crypto.createHmac('sha256', MERCHANT_KEY)
        .update(hashStr + MERCHANT_SALT)
        .digest('base64');

      // PayTR iFrame için form verileri
      const formData = {
        merchant_id: MERCHANT_ID,
        user_ip: userInfo.ip,
        merchant_oid,
        email,
        payment_amount,
        paytr_token,
        user_basket,
        debug_on,
        no_installment,
        max_installment,
        user_name,
        user_address,
        user_phone,
        merchant_ok_url,
        merchant_fail_url,
        timeout_limit,
        currency,
        test_mode,
        lang,
        merchant_notify_url: `https://eraslanmedya.com/api/payment/paytr`
      };

      // PayTR API'ye istek
      const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formData)
      });

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        if (data.status === 'success') {
          return NextResponse.json({ token: data.token });
        } else {
          console.error('PayTR Error:', data);
          throw new Error(data.reason || 'PayTR\'den beklenmeyen bir yanıt alındı');
        }
      } catch (e) {
        console.error('PayTR Raw Response:', responseText);
        throw new Error('PayTR\'den geçersiz yanıt alındı: ' + responseText);
      }
    } 
    // Eğer application/x-www-form-urlencoded ise, webhook bildirimidir
    else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
      // Body'yi raw text olarak al
      const rawBody = await request.text();
      
      // URL-encoded formatındaki veriyi parse et
      const formData = new URLSearchParams(rawBody);
      
      // Gerekli alanları al
      const merchant_oid = formData.get('merchant_oid');
      const status = formData.get('status');
      const total_amount = formData.get('total_amount');
      const hash = formData.get('hash');

      console.log('PayTR Webhook Data:', {
        merchant_oid,
        status,
        total_amount,
        hash,
        rawBody
      });

      // Hash doğrulama
      const hashStr = `${MERCHANT_ID}${merchant_oid}${total_amount}${MERCHANT_SALT}`;
      const calculatedHash = crypto.createHmac('sha256', MERCHANT_KEY)
        .update(hashStr)
        .digest('base64');

      if (hash !== calculatedHash) {
        console.error('Hash doğrulama hatası:', {
          received: hash,
          calculated: calculatedHash,
          merchantId: MERCHANT_ID,
          merchantOid: merchant_oid,
          totalAmount: total_amount
        });
        return new NextResponse('FAIL', { 
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Sipariş durumunu güncelle
      const orderStatus = status === 'success' ? 'processing' : 'cancelled';
      const paymentStatus = status === 'success' ? 'paid' : 'failed';

      // Siparişi bul ve güncelle
      const order = await Order.findById(merchant_oid);
      if (!order) {
        console.error('Sipariş bulunamadı:', merchant_oid);
        return new NextResponse('FAIL', { 
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Sipariş durumunu güncelle
      order.status = orderStatus;
      order.paymentStatus = paymentStatus;
      order.paymentDetails = {
        ...order.paymentDetails,
        status: paymentStatus,
        amount: total_amount / 100,
        paidAt: status === 'success' ? new Date() : null,
        paymentType: 'paytr',
        paytrMerchantOid: merchant_oid,
        paytrResponse: Object.fromEntries(formData)
      };

      await order.save();
      
      // PayTR'ye başarılı yanıt dön
      return new NextResponse('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Desteklenmeyen content type
    return new NextResponse('FAIL', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('PayTR error:', error);
    
    // Webhook isteği için text/plain yanıt
    if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      return new NextResponse('FAIL', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Normal istek için JSON yanıt
    return NextResponse.json(
      { 
        error: 'Ödeme başlatılırken bir hata oluştu',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 