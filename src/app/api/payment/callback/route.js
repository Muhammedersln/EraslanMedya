import { verifyPaymentCallback } from '@/lib/paytr';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';

export async function POST(request) {
  try {
    // IP kontrolü
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('x-client-ip');
                    
    // PayTR'nin IP adreslerini kontrol et
    const allowedIps = ['193.192.59.22', '193.192.59.23'];
    if (!allowedIps.includes(clientIp)) {
      console.error('Unauthorized callback attempt from IP:', clientIp);
      return new Response('OK'); // PayTR her zaman "OK" bekler
    }

    const body = await request.formData();
    const params = Object.fromEntries(body.entries());
    
    // Callback işlemini logla
    console.log('Payment callback received:', {
      orderId: params.merchant_oid,
      status: params.status,
      amount: params.total_amount,
      timestamp: new Date().toISOString()
    });
    
    const result = verifyPaymentCallback(params);
    
    if (result.status === 'success') {
      await connectToDatabase();
      
      // Sipariş ID'sini kullanarak geçici siparişi bul
      const tempOrder = await Order.findOne({ _id: params.merchant_oid });
      
      if (!tempOrder) {
        console.error('Order not found:', params.merchant_oid);
        return new Response('OK');
      }

      // Siparişi güncelle
      tempOrder.status = 'processing';
      tempOrder.paymentDetails = {
        status: 'paid',
        amount: result.amount,
        paidAt: new Date(),
        paymentId: params.payment_id,
        paymentType: 'paytr'
      };

      await tempOrder.save();
      
      // Sepeti temizle
      await Cart.deleteMany({ user: tempOrder.user });
      
      console.log('Payment successful and order updated:', {
        orderId: tempOrder._id,
        paymentId: params.payment_id,
        amount: params.total_amount
      });
    } else {
      console.error('Payment failed:', {
        reason: params.failed_reason_msg
      });
    }

    // PayTR her zaman "OK" yanıtı bekler
    return new Response('OK');
  } catch (error) {
    console.error('Payment callback error:', error);
    // Hata durumunda bile "OK" dönmeliyiz
    return new Response('OK');
  }
} 