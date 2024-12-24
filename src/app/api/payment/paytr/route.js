import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Order from '@/lib/models/Order';
import dbConnect from '@/lib/dbConnect';

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;
const TEST_MODE = process.env.NODE_ENV === 'development' ? '1' : '0';

export async function POST(req) {
  try {
    const { orderDetails, userInfo } = await req.json();

    // PayTR için gerekli parametreler
    const merchant_oid = orderDetails.id;
    const email = userInfo.email;
    const payment_amount = Math.floor(orderDetails.totalAmount * 100); // TL to kuruş
    const user_basket = JSON.stringify(orderDetails.items.map(item => [
      item.product.name,
      item.price,
      item.quantity
    ]));
    const user_name = userInfo.name || userInfo.email;
    const user_address = 'Digital Delivery';
    const user_phone = userInfo.phone || 'NA';
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
      // Callback URL'i ekle
      merchant_notify_url: 'https://eraslanmedya.com/api/payment/callback'
    };

    // PayTR API'ye istek
    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(formData)
    });

    const data = await response.json();

    if (data.status === 'success') {
      return NextResponse.json({ token: data.token });
    } else {
      throw new Error(data.reason);
    }
  } catch (error) {
    console.error('PayTR token error:', error);
    return NextResponse.json(
      { error: 'Ödeme başlatılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PayTR bildirim webhook'u
export async function PUT(req) {
  try {
    await dbConnect();

    const data = await req.formData();
    const merchant_oid = data.get('merchant_oid');
    const status = data.get('status');
    const total_amount = data.get('total_amount');
    const hash = data.get('hash');

    // Hash doğrulama
    const hashStr = `${MERCHANT_ID}${merchant_oid}${total_amount}${MERCHANT_SALT}`;
    const calculatedHash = crypto.createHmac('sha256', MERCHANT_KEY)
      .update(hashStr)
      .digest('base64');

    if (hash !== calculatedHash) {
      return NextResponse.json({ status: 'fail', message: 'Hash doğrulaması başarısız' });
    }

    // Sipariş durumunu güncelle
    const orderStatus = status === 'success' ? 'processing' : 'cancelled';
    const paymentStatus = status === 'success' ? 'paid' : 'failed';

    // Siparişi bul ve güncelle
    const order = await Order.findById(merchant_oid);
    if (!order) {
      throw new Error('Sipariş bulunamadı');
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
      paytrResponse: Object.fromEntries(data.entries())
    };

    await order.save();

    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('PayTR webhook error:', error);
    return NextResponse.json(
      { error: 'Bildirim işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 