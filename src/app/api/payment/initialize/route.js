import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';
import Order from '@/lib/models/Order';
import dbConnect from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const {
      orderId,
      amount,
      email,
      userName,
      userPhone,
      userAddress,
      userBasket,
      cartItems
    } = await request.json();

    await dbConnect();

    // Geçici sipariş oluştur (pending status ile)
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        user: user.id,
        items: cartItems,
        status: 'pending', // Ödeme başarılı olana kadar pending
        totalAmount: amount / 100, // Kuruş to TL
        paymentStatus: 'pending',
        shippingAddress: userAddress,
        email: email,
        phone: userPhone
      },
      { new: true, upsert: true }
    );

    // PayTR için gerekli değişkenler
    const merchant_id = process.env.PAYTR_MERCHANT_ID;
    const merchant_key = process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
    const merchant_ok_url = `${process.env.NEXT_PUBLIC_API_URL}/payment/success`;
    const merchant_fail_url = `${process.env.NEXT_PUBLIC_API_URL}/payment/fail`;
    const callback_url = `${process.env.NEXT_PUBLIC_API_URL}/api/payment/callback`;

    console.log('PayTR URLs:', {
      merchant_ok_url,
      merchant_fail_url,
      callback_url,
      base_url: process.env.NEXT_PUBLIC_API_URL
    });

    const timeout_limit = "30";
    const currency = "TL";
    const test_mode = "1";
    const debug_on = "1";
    const lang = "tr";

    // Benzersiz sipariş numarası
    const merchant_oid = order._id.toString();

    // User IP
    const user_ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Hash string
    const hashStr = `${merchant_id}${user_ip}${merchant_oid}${email}${amount}${userBasket}${test_mode}`;
    const paytr_token = crypto.createHmac('sha256', merchant_key)
      .update(hashStr + merchant_salt)
      .digest('base64');

    const params = {
      merchant_id,
      user_ip,
      merchant_oid,
      email,
      payment_amount: amount,
      paytr_token,
      user_basket: userBasket,
      merchant_ok_url,
      merchant_fail_url,
      callback_url,
      user_name: userName,
      user_phone: userPhone,
      user_address: userAddress,
      timeout_limit,
      debug_on,
      test_mode,
      currency,
      lang,
      no_installment: "0",
      max_installment: "0"
    };

    // PayTR token al
    console.log('PayTR parameters:', {
      merchant_id,
      merchant_oid,
      email,
      payment_amount: amount,
      user_basket: userBasket,
      urls: {
        merchant_ok_url,
        merchant_fail_url,
        callback_url
      }
    });

    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(params)
    });

    const paytrData = await paytrResponse.json();

    if (paytrData.status === 'success') {
      return NextResponse.json({
        status: 'success',
        token: paytrData.token,
        orderId: order._id
      });
    } else {
      // PayTR'den token alınamazsa siparişi sil
      await Order.findByIdAndDelete(order._id);
      
      return NextResponse.json({
        status: 'error',
        error: paytrData.reason || 'Token alınamadı'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 