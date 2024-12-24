import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';
import Order from '@/lib/models/Order';
import { connectToDatabase } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Siparişi bul ve sil
    const result = await Order.findOneAndDelete({
      _id: params.orderId,
      user: user.id
    });
    
    if (!result) {
      console.log('Order not found or already deleted:', params.orderId);
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log('Order cancelled:', {
      orderId: params.orderId,
      userId: user.id
    });

    return NextResponse.json({ 
      success: true,
      orderId: params.orderId
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 