import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';
import Order from '@/lib/models/Order';
import dbConnect from '@/lib/db';
import { createPaymentToken } from '@/lib/paytr';

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
    const order = new Order({
      _id: orderId,
      user: user.id,
      items: cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate || 0.18,
        productData: item.productData,
        targetCount: item.targetCount,
        currentCount: 0
      })),
      status: 'pending',
      totalAmount: amount / 100,
      paymentStatus: 'pending',
      paymentDetails: {
        status: 'pending',
        amount: amount / 100
      }
    });

    await order.save();

    // Get user IP
    const userIp = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  request.headers.get('x-client-ip') ||
                  '127.0.0.1';

    // Create payment token using the library function
    const paymentData = await createPaymentToken({
      orderId: orderId,
      amount,
      email,
      userBasket,
      userIp,
      currency: 'TL',
      testMode: '1',
      noInstallment: '1',
      maxInstallment: '1',
      callbackUrl: "https://www.eraslanmedya.com/api/payment/callback",
      userName: userName || email.split('@')[0],
      userPhone: userPhone || '05000000000',
      userAddress: userAddress || 'Türkiye'
    });

    if (paymentData.status === 'success') {
      return NextResponse.json({
        status: 'success',
        token: paymentData.token,
        orderId: orderId
      });
    } else {
      // PayTR'den token alınamazsa siparişi sil
      await Order.findByIdAndDelete(orderId);
      
      return NextResponse.json({
        status: 'error',
        error: paymentData.error || 'Token alınamadı'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 