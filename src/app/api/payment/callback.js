import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

export async function POST(req) {
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
      return new Response('PAYTR notification failed: hash mismatch', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Siparişi bul ve güncelle
    const order = await Order.findById(merchant_oid);
    if (!order) {
      return new Response('PAYTR notification failed: order not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Ödeme durumuna göre sipariş durumunu güncelle
    if (status === 'success') {
      order.status = 'processing'; // Ödeme başarılıysa siparişi aktif et
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        ...order.paymentDetails,
        status: 'paid',
        amount: total_amount / 100,
        paidAt: new Date(),
        paymentType: 'paytr',
        paytrMerchantOid: merchant_oid,
        paytrResponse: Object.fromEntries(data.entries())
      };
    } else {
      // Ödeme başarısızsa sipariş iptal durumunda kalsın
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      order.paymentDetails = {
        ...order.paymentDetails,
        status: 'failed',
        amount: total_amount / 100,
        failedAt: new Date(),
        paymentType: 'paytr',
        paytrMerchantOid: merchant_oid,
        paytrResponse: Object.fromEntries(data.entries())
      };
    }

    await order.save();

    // PayTR'ye OK yanıtı gönder
    return new Response('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('PayTR callback error:', error);
    return new Response('PAYTR notification failed: ' + error.message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
} 