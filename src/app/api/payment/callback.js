import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

export async function POST(req) {
  console.log('PayTR callback received');
  
  try {
    await dbConnect();

    const data = await req.formData();
    const merchant_oid = data.get('merchant_oid');
    const status = data.get('status');
    const total_amount = data.get('total_amount');
    const hash = data.get('hash');

    console.log('PayTR callback data:', {
      merchant_oid,
      status,
      total_amount
    });

    // Hash doğrulama
    const hashStr = `${MERCHANT_ID}${merchant_oid}${total_amount}${MERCHANT_SALT}`;
    const calculatedHash = crypto.createHmac('sha256', MERCHANT_KEY)
      .update(hashStr)
      .digest('base64');

    if (hash !== calculatedHash) {
      console.error('PayTR hash mismatch:', {
        received: hash,
        calculated: calculatedHash
      });
      return new Response('PAYTR notification failed: hash mismatch', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Siparişi bul ve güncelle
    const order = await Order.findById(merchant_oid);
    if (!order) {
      console.error('PayTR order not found:', merchant_oid);
      return new Response('PAYTR notification failed: order not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Ödeme durumuna göre sipariş durumunu güncelle
    if (status === 'success') {
      order.status = 'processing';
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
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      order.paymentDetails = {
        ...order.paymentDetails,
        status: 'failed',
        amount: total_amount / 100,
        failedAt: new Date(),
        paymentType: 'paytr',
        paytrMerchantOid: merchant_oid,
        paytrResponse: Object.fromEntries(data.entries()),
        failureReason: data.get('failed_reason_code') || data.get('failed_reason_msg')
      };
    }

    await order.save();
    console.log('PayTR order updated:', {
      orderId: merchant_oid,
      status: order.status,
      paymentStatus: order.paymentStatus
    });

    // PayTR'ye başarılı yanıt gönder
    return new Response('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('PayTR callback error:', error);
    // Hata durumunda bile PayTR'ye OK yanıtı gönder
    return new Response('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
} 