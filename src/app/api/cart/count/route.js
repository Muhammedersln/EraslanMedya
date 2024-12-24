import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/lib/models/Cart';
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
    
    // Get all cart items and populate product info
    const cartItems = await Cart.find({ user: user.id }).populate('product');
    
    // Count only items with valid products
    const count = cartItems.filter(item => item.product).length;

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 