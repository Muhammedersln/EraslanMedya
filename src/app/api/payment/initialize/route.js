import { NextResponse } from 'next/server';
import { createPaymentToken } from '@/lib/paytr';
import { auth } from '@/lib/middleware/auth';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { connectToDatabase } from '@/lib/db';

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

    await connectToDatabase();

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
      cartItems
    } = body;

    // Validate cart items
    const validatedItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }

        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          taxRate: product.taxRate || 0.18,
          productData: item.productData,
          targetCount: item.targetCount,
          currentCount: 0
        };
      })
    );

    // Create temporary order
    const tempOrder = await Order.create({
      _id: orderId,
      user: user.id,
      items: validatedItems,
      totalAmount: amount / 100, // Convert from kuruş to TL
      status: 'pending',
      paymentDetails: {
        status: 'pending'
      }
    });

    console.log('Temporary order created:', {
      orderId: tempOrder._id,
      userId: user.id,
      amount: amount / 100
    });

    // Get PayTR token
    const paymentData = await createPaymentToken({
      orderId,
      amount,
      email,
      userBasket,
      userIp: request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              request.headers.get('x-client-ip') ||
              '127.0.0.1',
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payment/callback`,
      testMode: '1',
      currency: 'TL',
      noInstallment: '1',
      maxInstallment: '1'
    });

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 