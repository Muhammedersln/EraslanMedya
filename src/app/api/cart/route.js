import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/lib/models/Cart';
import { auth } from '@/lib/middleware/auth';

// Get cart items
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
    const cartItems = await Cart.find({ user: user.id })
      .populate('product')
      .sort('-createdAt');

    return NextResponse.json(cartItems);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Add to cart
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
    const { productId, quantity = 1, productData } = await request.json();

    // Check if item already exists
    let cartItem = await Cart.findOne({
      user: user.id,
      product: productId
    });

    if (cartItem) {
      cartItem.quantity = quantity;
      if (productData) {
        cartItem.productData = productData;
      }
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user: user.id,
        product: productId,
        quantity,
        productData
      });
    }

    await cartItem.populate('product');

    return NextResponse.json(cartItem);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Update cart item
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
    const itemId = searchParams.get('id');
    const { quantity, productData } = await request.json();

    const cartItem = await Cart.findOne({
      _id: itemId,
      user: user.id
    });

    if (!cartItem) {
      return NextResponse.json(
        { message: 'Cart item not found' },
        { status: 404 }
      );
    }

    if (quantity) {
      cartItem.quantity = quantity;
    }

    if (productData) {
      cartItem.productData = productData;
    }

    await cartItem.save();
    await cartItem.populate('product');

    return NextResponse.json(cartItem);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Delete cart item
export async function DELETE(request) {
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
    const itemId = searchParams.get('id');

    const cartItem = await Cart.findOneAndDelete({
      _id: itemId,
      user: user.id
    });

    if (!cartItem) {
      return NextResponse.json(
        { message: 'Cart item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cart item deleted' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 