import { NextResponse } from 'next/server';
import { createPaymentToken } from '@/lib/paytr';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      email,
      userBasket,
      callbackUrl,
    } = body;

    // Get user IP from request headers
    const userIp = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  '127.0.0.1';

    // Create payment token
    const paymentData = await createPaymentToken({
      orderId,
      amount: Math.round(amount * 100), // Convert to kuruş
      email,
      userBasket,
      userIp,
      callbackUrl,
    });

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}

// Payment callback handler
export async function PUT(request) {
  try {
    const body = await request.json();
    const result = verifyPaymentCallback(body);

    if (result.isValid) {
      // TODO: Update order status in your database
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid payment callback' },
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