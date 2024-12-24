import { NextResponse } from 'next/server';
import { createPaymentToken } from '@/lib/paytr';
import { auth } from '@/lib/middleware/auth';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';

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
      cartItems,
      callbackUrl,
    } = body;

    // Validate required parameters
    const requiredParams = {
      orderId,
      amount,
      email,
      userName,
      userPhone,
      userAddress,
      userBasket,
      cartItems,
      callbackUrl
    };

    const missingParams = Object.entries(requiredParams)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingParams.length > 0) {
      console.error('Missing parameters:', missingParams);
      return NextResponse.json(
        { error: `Missing required parameters: ${missingParams.join(', ')}` },
        { status: 400 }
      );
    }

    // Get user IP
    const userIp = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  request.headers.get('x-client-ip') ||
                  '127.0.0.1';

    // Create payment token first
    const paymentData = await createPaymentToken({
      orderId,
      amount,
      email,
      userBasket,
      userIp,
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payment/callback`,
      testMode: '1',
      currency: 'TL',
      noInstallment: '1',
      maxInstallment: '1'
    });

    if (paymentData.status === 'success') {
      // Validate cart items and create temporary order
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
    }

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