import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import SupportTicket from '@/lib/models/SupportTicket';
import { adminAuth } from '@/lib/middleware/auth';

// Get admin stats
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

    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get total revenue
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'username email')
      .populate('items.product', 'name price')
      .sort('-createdAt')
      .limit(5);

    // Get product stats
    const products = await Product.find();
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.active).length;

    // Get support ticket stats
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      totalProducts,
      activeProducts,
      totalTickets,
      openTickets
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Update order status
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
    await order.populate('items.product', 'name price');

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Update support ticket
export async function POST(request) {
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
    const ticketId = searchParams.get('id');
    const { status, message } = await request.json();

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (status) {
      ticket.status = status;
    }

    if (message) {
      ticket.responses.push({
        message,
        isAdmin: true
      });
    }

    await ticket.save();

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 