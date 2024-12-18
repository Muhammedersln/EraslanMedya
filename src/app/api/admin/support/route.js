import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import { adminAuth } from '@/lib/middleware/auth';

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
    const tickets = await SupportTicket.find()
      .populate('user', 'username email')
      .sort('-createdAt');

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 