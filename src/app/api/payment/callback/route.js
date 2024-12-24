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

    await connectToDatabase();

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
      try {
        // Sipariş ID'sini kullanarak geçici siparişi bul
        const tempOrder = await Order.findById(params.merchant_oid);
        
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
        console.log('Clearing cart for user:', tempOrder.user);
        const deleteResult = await Cart.deleteMany({ user: tempOrder.user });
        console.log('Cart clear result:', deleteResult);
        
        console.log('Payment successful and order updated:', {
          orderId: tempOrder._id,
          userId: tempOrder.user,
          paymentId: params.payment_id,
          amount: params.total_amount
        });
      } catch (error) {
        console.error('Error updating order or clearing cart:', error);
      }
    } else {
      try {
        // Başarısız ödeme durumunda siparişi sil
        await Order.findByIdAndDelete(params.merchant_oid);
        console.log('Failed payment order deleted:', params.merchant_oid);
      } catch (error) {
        console.error('Error deleting failed order:', error);
      }

      console.error('Payment failed:', {
        orderId: params.merchant_oid,
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