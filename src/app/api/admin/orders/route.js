import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { adminAuth } from '@/lib/middleware/auth';

// Get all orders
export async function GET(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Önce Product modelini yükle
    await Product.init();

    const orders = await Order.find()
      .populate('user', 'username email')
      .populate({
        path: 'items.product',
        model: Product,
        select: 'name price subCategory category'
      })
      .sort('-createdAt')
      .lean()
      .exec();

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product ? {
          ...item.product,
          price: parseFloat(item.product.price || 0)
        } : null,
        price: parseFloat(item.price || 0),
        taxRate: parseFloat(item.taxRate || 0.18),
        currentCount: parseInt(item.currentCount || 0),
        targetCount: parseInt(item.targetCount || 0)
      })),
      totalAmount: parseFloat(order.totalAmount || 0)
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Update order
export async function PATCH(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const { status, currentCount } = await request.json();

    const order = await Order.findById(orderId);
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
    await order.populate({
      path: 'items.product',
      model: Product,
      select: 'name price subCategory category'
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Delete order
export async function DELETE(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    const order = await Order.findByIdAndDelete(orderId);
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