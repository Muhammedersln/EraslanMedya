import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import { auth } from '@/lib/middleware/auth';
import User from '@/lib/models/User';
import { sendSupportTicketNotificationEmail } from '@/lib/utils/sendEmail';

// Get user's support tickets
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
    const tickets = await SupportTicket.find({ user: user.id })
      .sort('-createdAt');

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Create support ticket
export async function POST(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { subject, message, priority = 'medium' } = await request.json();

    const ticket = await SupportTicket.create({
      user: user.id,
      subject,
      message,
      priority
    });

    try {
      // Kullanıcı bilgilerini veritabanından al
      const userDetails = await User.findById(user.id);
      if (userDetails) {
        // Kullanıcı bilgileri
        const userInfo = {
          name: userDetails.name,
          email: userDetails.email
        };
        
        // Bildirim e-postası gönder
        await sendSupportTicketNotificationEmail(ticket, userInfo);
        console.log('Destek talebi bildirim e-postası gönderildi. Talep ID:', ticket._id);
      }
    } catch (emailError) {
      // E-posta gönderilemese bile işlem devam etsin, sadece log atalım
      console.error('Destek talebi bildirim e-postası gönderme hatası:', emailError);
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Add response to ticket
export async function PATCH(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('id');
    const { message } = await request.json();

    const ticket = await SupportTicket.findOne({
      _id: ticketId,
      user: user.id
    });

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      );
    }

    ticket.responses.push({
      message,
      isAdmin: false
    });

    await ticket.save();

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 