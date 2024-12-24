import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import dbConnect from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Siparişi kontrol et
    const order = await Order.findOne({
      _id: params.orderId,
      user: user.id
    });

    if (!order) {
      return NextResponse.json(
        { status: 'error', message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status === 'processing' && order.paymentDetails?.status === 'paid') {
      return NextResponse.json({
        status: 'success',
        message: 'Ödeme başarıyla tamamlandı',
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentDetails.status
        }
      });
    }

    if (order.status === 'cancelled' || order.paymentDetails?.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        message: 'Ödeme başarısız oldu',
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentDetails?.status
        }
      });
    }

    return NextResponse.json({
      status: 'pending',
      message: 'Ödeme işlemi devam ediyor',
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentDetails?.status
      }
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
} 