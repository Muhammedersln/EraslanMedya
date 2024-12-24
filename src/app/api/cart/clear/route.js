import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';
import Cart from '@/lib/models/Cart';
import dbConnect from '@/lib/db';

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
    
    // Önce sepeti kontrol et
    const cartItems = await Cart.find({ user: user.id });
    console.log('Current cart items:', {
      userId: user.id,
      itemCount: cartItems.length
    });
    
    // Sepeti temizle
    const result = await Cart.deleteMany({ user: user.id });
    
    // Temizleme sonucunu kontrol et
    const remainingItems = await Cart.find({ user: user.id });
    
    console.log('Cart clearing result:', {
      userId: user.id,
      deletedCount: result.deletedCount,
      remainingItems: remainingItems.length
    });

    if (remainingItems.length > 0) {
      console.error('Cart not fully cleared:', {
        userId: user.id,
        remainingItems: remainingItems.length
      });
    }

    return NextResponse.json({ 
      success: true,
      deletedCount: result.deletedCount,
      remainingItems: remainingItems.length
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 