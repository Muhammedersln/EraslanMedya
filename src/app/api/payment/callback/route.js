import { verifyPaymentCallback } from '@/lib/paytr';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

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

    await dbConnect();

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
    
    try {
      // Siparişi bul
      const order = await Order.findById(params.merchant_oid);
      
      if (!order) {
        console.error('Order not found:', params.merchant_oid);
        return new Response('OK');
      }

      if (result.status === 'success') {
        // Siparişi güncelle
        order.status = 'processing';
        order.paymentDetails = {
          status: 'paid',
          amount: result.amount,
          paidAt: new Date(),
          paymentId: params.payment_id,
          paymentType: 'paytr'
        };
      } else {
        // Başarısız ödeme
        order.status = 'cancelled';
        order.paymentDetails = {
          status: 'failed',
          amount: result.amount,
          paidAt: new Date(),
          paymentId: params.payment_id,
          paymentType: 'paytr',
          failReason: params.failed_reason_msg
        };
      }

      await order.save();
      
      console.log('Order updated:', {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentDetails.status
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }

    // PayTR her zaman "OK" yanıtı bekler
    return new Response('OK');
  } catch (error) {
    console.error('Payment callback error:', error);
    // Hata durumunda bile "OK" dönmeliyiz
    return new Response('OK');
  }
} 