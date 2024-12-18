import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import SupportTicket from '@/lib/models/SupportTicket';
import { adminAuth } from '@/lib/middleware/auth';

export async function GET(req, context) {
  try {
    const user = await adminAuth(req);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Await params before accessing id
    const params = await context.params;
    const id = params.id;

    // Get user details
    const userData = await User.findById(id).select('-password');
    if (!userData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's orders
    const orders = await Order.find({ user: id })
      .populate('items.product', 'name price')
      .sort('-createdAt')
      .limit(10);

    // Get user's support tickets
    const supportTickets = await SupportTicket.find({ user: id })
      .sort('-createdAt')
      .limit(10);

    // Calculate statistics
    const allOrders = await Order.find({ user: id });
    const stats = {
      totalOrders: allOrders.length,
      completedOrders: allOrders.filter(order => order.status === 'completed').length,
      totalSpent: allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      openTickets: await SupportTicket.countDocuments({ user: id, status: 'open' })
    };

    // Combine all data
    const response = {
      ...userData.toObject(),
      orders,
      supportTickets,
      stats
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 