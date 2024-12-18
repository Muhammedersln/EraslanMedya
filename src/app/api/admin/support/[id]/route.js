import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import { adminAuth } from '@/lib/middleware/auth';

export async function GET(request, context) {
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

    const ticket = await SupportTicket.findById(id).populate('user', 'username email');
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
    
    const body = await request.json();
    const { status, message } = body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Only update status if provided and different from current status
    if (status && status !== ticket.status) {
      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return NextResponse.json(
          { message: 'Invalid status value' },
          { status: 400 }
        );
      }
      ticket.status = status;
    }

    // Add response if message is provided
    if (message && message.trim()) {
      ticket.responses.push({
        message: message.trim(),
        isAdmin: true,
        createdAt: new Date()
      });
    }

    await ticket.save();
    const updatedTicket = await SupportTicket.findById(id).populate('user', 'username email');

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating support ticket:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
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

    const ticket = await SupportTicket.findByIdAndDelete(id);
    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 