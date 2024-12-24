import { NextResponse } from 'next/server';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import dbConnect from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const merchant_oid = formData.get('merchant_oid');
    const status = formData.get('status');
    const hash = formData.get('hash');

    // Hash doğrulama
    const merchant_key = process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
    const hashStr = formData.get('merchant_oid') + merchant_salt + status + formData.get('total_amount');
    const computedHash = crypto.createHmac('sha256', merchant_key).update(hashStr).digest('base64');

    if (hash !== computedHash) {
      console.error('Invalid hash in callback');
      return NextResponse.json({ status: 'error', message: 'Invalid hash' }, { status: 400 });
    }

    await dbConnect();

    // Siparişi bul
    const order = await Order.findById(merchant_oid);
    if (!order) {
      console.error('Order not found:', merchant_oid);
      return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
    }

    console.log('Processing payment callback:', {
      orderId: merchant_oid,
      status,
      currentOrderStatus: order.status
    });

    if (status === 'success') {
      // Ödeme başarılıysa siparişi onayla
      order.status = 'confirmed';
      order.paymentStatus = 'paid';
      await order.save();

      // Sepeti temizle
      try {
        const cartResult = await Cart.deleteMany({ user: order.user });
        console.log('Cart cleared after successful payment:', {
          orderId: merchant_oid,
          userId: order.user,
          deletedCount: cartResult.deletedCount
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
      }

      return NextResponse.json({ status: 'success' });
    } else {
      // Ödeme başarısızsa siparişi iptal et ve sil
      console.log('Payment failed, deleting order:', merchant_oid);
      await Order.findByIdAndDelete(merchant_oid);
      
      return NextResponse.json({ status: 'error', message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
} 