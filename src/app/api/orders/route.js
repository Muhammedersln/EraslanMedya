import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { auth } from '@/lib/middleware/auth';

export async function POST(req) {
  try {
    const user = await auth(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const orderData = await req.json();
    
    // Sipariş verilerini doğrula
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ message: 'Invalid order items' }, { status: 400 });
    }

    if (!orderData.totalAmount || isNaN(orderData.totalAmount)) {
      return NextResponse.json({ message: 'Invalid total amount' }, { status: 400 });
    }

    // Yeni sipariş oluştur
    const order = new Order({
      _id: orderData._id, // Client tarafından gönderilen ID'yi kullan
      user: user.id,
      items: orderData.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        productData: item.productData,
        targetCount: item.targetCount
      })),
      totalAmount: orderData.totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 dakika
    });

    // Siparişi kaydet
    const savedOrder = await order.save();
    
    // Otomatik iptal için timeout başlat
    setTimeout(async () => {
      try {
        const expiredOrder = await Order.findById(order._id);
        if (expiredOrder && expiredOrder.status === 'pending' && expiredOrder.paymentStatus === 'pending') {
          expiredOrder.status = 'cancelled';
          expiredOrder.paymentStatus = 'expired';
          await expiredOrder.save();
          console.log('Süresi dolmuş sipariş iptal edildi:', order._id);
        }
      } catch (error) {
        console.error('Sipariş iptal hatası:', error);
      }
    }, 2 * 60 * 1000); // 2 dakika

    return NextResponse.json(savedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const user = await auth(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const orders = await Order.find({ user: user.id })
      .sort({ createdAt: -1 })
      .populate('items.product');

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 