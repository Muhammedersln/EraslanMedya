import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';
import Cart from '@/lib/models/Cart';
import dbConnect from '@/lib/db';

export async function POST(req) {
  try {
    const user = await auth(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Kullanıcının sepetini temizle
    await Cart.deleteMany({ user: user.id });

    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { message: 'Failed to clear cart' },
      { status: 500 }
    );
  }
} 