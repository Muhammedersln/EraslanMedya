import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import { auth } from '@/lib/middleware/auth';

export async function GET(request, context) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const params = await context.params;
    const id = params.id;

    const ticket = await SupportTicket.findOne({
      _id: id,
      user: user.id
    }).populate('user', 'username email');

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const params = await context.params;
    const id = params.id;
    const { message } = await request.json();

    const ticket = await SupportTicket.findOne({
      _id: id,
      user: user.id
    });

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (message) {
      ticket.responses.push({
        message,
        isAdmin: false,
        createdAt: new Date()
      });
    }

    await ticket.save();
    await ticket.populate('user', 'username email');

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating support ticket:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 