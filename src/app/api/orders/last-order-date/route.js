import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { auth } from '@/lib/middleware/auth';

export async function GET(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const lastOrder = await Order.findOne({ user: user.id })
      .sort({ createdAt: -1 })
      .select('createdAt');

    return NextResponse.json({
      lastOrderDate: lastOrder ? lastOrder.createdAt : null
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 