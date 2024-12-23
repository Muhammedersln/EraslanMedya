import { NextResponse } from 'next/server';
import { createPaymentToken, verifyPaymentCallback } from '@/lib/paytr';
import { auth } from '@/lib/middleware/auth';
import Order from '@/lib/models/Order';

export async function POST(request) {
  try {
    // Authenticate user
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      orderId,
      amount,
      email,
      userName,
      userPhone,
      userAddress,
      userBasket,
      callbackUrl,
    } = body;

    // Get user IP
    const userIp = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  request.headers.get('x-client-ip') ||
                  '127.0.0.1';

    // Create payment token
    const paymentData = await createPaymentToken({
      orderId,
      amount,
      email,
      userName,
      userPhone,
      userAddress,
      userBasket,
      userIp,
      callbackUrl,
      testMode: '1',
      currency: 'TL',
      noInstallment: '1',
      maxInstallment: '1'
    });

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Payment callback handler
export async function PUT(request) {
  try {
    const body = await request.json();
    const result = verifyPaymentCallback(body);

    if (result.status === 'success') {
      // Update order status
      await Order.findByIdAndUpdate(result.orderId, {
        status: 'processing',
        'paymentDetails.status': 'paid',
        'paymentDetails.amount': result.amount,
        'paymentDetails.paidAt': new Date()
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error || 'Invalid payment callback' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { error: 'Payment callback processing failed' },
      { status: 500 }
    );
  }
} 