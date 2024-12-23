import { NextResponse } from 'next/server';
import { verifyPaymentCallback } from '@/lib/paytr';
import { updateOrderStatus } from '@/lib/orders';

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
      // Ödeme başarılı - siparişi güncelle
      await updateOrderStatus(params.merchant_oid, 'processing', {
        paymentId: params.payment_id,
        paymentAmount: params.total_amount,
        paymentType: 'paytr'
      });
      
      console.log('Payment successful:', {
        orderId: params.merchant_oid,
        paymentId: params.payment_id,
        amount: params.total_amount
      });
    } else {
      // Ödeme başarısız - siparişi iptal et
      await updateOrderStatus(params.merchant_oid, 'failed', {
        error: params.failed_reason_msg || 'Ödeme başarısız'
      });
      
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