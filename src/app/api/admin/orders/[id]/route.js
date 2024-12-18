import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { adminAuth } from '@/lib/middleware/auth';

export async function PATCH(request, context) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const params = await context.params;
    const id = params.id;
    const { status, currentCount } = await request.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    if (status) {
      order.status = status;
    }

    if (typeof currentCount === 'number') {
      order.items.forEach(item => {
        item.currentCount = currentCount;
      });
    }

    await order.save();
    await order.populate('user', 'username email');
    await order.populate('items.product', 'name price');

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const params = await context.params;
    const id = params.id;

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 