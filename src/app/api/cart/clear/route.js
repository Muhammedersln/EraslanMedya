import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';
import Cart from '@/lib/models/Cart';
import { connectToDatabase } from '@/lib/db';

export async function POST(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Sepeti temizle
    const result = await Cart.deleteMany({ user: user.id });
    
    console.log('Cart cleared for user:', {
      userId: user.id,
      deletedCount: result.deletedCount
    });

    return NextResponse.json({ 
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 