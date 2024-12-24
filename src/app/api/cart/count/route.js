import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';
import Cart from '@/lib/models/Cart';
import dbConnect from '@/lib/db';

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

    const count = await Cart.countDocuments({ user: user.id });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting cart count:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 