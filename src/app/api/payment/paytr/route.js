import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;
const TEST_MODE = process.env.NODE_ENV === 'development' ? '1' : '0';

export async function POST(req) {
  try {
    await dbConnect();
    const { orderDetails, userInfo } = await req.json();

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

    // Response içeriğini text olarak al
    const responseText = await response.text();
    
    // Response'un JSON olup olmadığını kontrol et
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('PayTR Raw Response:', responseText);
      throw new Error('PayTR\'den geçersiz yanıt alındı: ' + responseText);
    }

    if (data.status === 'success') {
      return NextResponse.json({ token: data.token });
    } else {
      console.error('PayTR Error:', data);
      throw new Error(data.reason || 'PayTR\'den beklenmeyen bir yanıt alındı');
    }
  } catch (error) {
    console.error('PayTR token error:', error.message);
    return NextResponse.json(
      { 
        error: 'Ödeme başlatılırken bir hata oluştu',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PayTR bildirim webhook'u
export async function PUT(req) {
  try {
    await dbConnect();

    // URL-encoded form verisini al
    const text = await req.text();
    const params = new URLSearchParams(text);
    const data = Object.fromEntries(params);

    const merchant_oid = data.merchant_oid;
    const status = data.status;
    const total_amount = data.total_amount;
    const hash = data.hash;

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
      return NextResponse.json(
        { status: 'fail', message: 'Hash doğrulaması başarısız' },
        { status: 400 }
      );
    }

    // Sipariş durumunu güncelle
    const orderStatus = status === 'success' ? 'processing' : 'cancelled';
    const paymentStatus = status === 'success' ? 'paid' : 'failed';

    // Siparişi bul ve güncelle
    const order = await Order.findById(merchant_oid);
    if (!order) {
      console.error('Sipariş bulunamadı:', merchant_oid);
      return NextResponse.json(
        { status: 'fail', message: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    // Sipariş durumunu güncelle
    order.status = orderStatus;
    order.paymentStatus = paymentStatus;
    order.paymentDetails = {
      ...order.paymentDetails,
      status: paymentStatus,
      amount: total_amount / 100, // Kuruş to TL
      paidAt: status === 'success' ? new Date() : null,
      paymentType: 'paytr',
      paytrMerchantOid: merchant_oid,
      paytrResponse: data
    };

    await order.save();
    
    // PayTR'ye OK yanıtı dön
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });

  } catch (error) {
    console.error('PayTR webhook error:', error);
    return NextResponse.json(
      { error: 'Bildirim işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 