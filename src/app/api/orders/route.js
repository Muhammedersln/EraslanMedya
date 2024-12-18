import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import Product from '@/lib/models/Product';
import { auth } from '@/lib/middleware/auth';

// Get user orders
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
    const orders = await Order.find({ user: user.id })
      .populate('items.product')
      .sort('-createdAt');

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Create order
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
    const { cartItems } = await request.json();

    // Validate cart items
    const validatedItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }

        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          taxRate: product.taxRate || 0.18,
          productData: item.productData,
          targetCount: item.targetCount,
          currentCount: 0
        };
      })
    );

    // Calculate total amount
    const totalAmount = validatedItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity * (1 + item.taxRate));
    }, 0);

    // Create order
    const order = await Order.create({
      user: user.id,
      items: validatedItems,
      totalAmount
    });

    // Clear cart
    await Cart.deleteMany({ user: user.id });

    await order.populate('items.product');

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Update order status
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
    const orderId = searchParams.get('id');
    const { status } = await request.json();

    const order = await Order.findOne({
      _id: orderId,
      user: user.id
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    order.status = status;
    await order.save();
    await order.populate('items.product');

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 