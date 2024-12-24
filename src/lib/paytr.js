const crypto = require('crypto');

// PayTR API Configuration
const PAYTR_CONFIG = {
  merchantId: process.env.PAYTR_MERCHANT_ID,
  merchantKey: process.env.PAYTR_MERCHANT_KEY,
  merchantSalt: process.env.PAYTR_MERCHANT_SALT,
  apiUrl: 'https://www.paytr.com/odeme/api/get-token',
};

// Helper function to generate hash
const generatePaytrHash = (params) => {
  // Create hash string according to PayTR documentation
  const hashStr = `${params.merchant_id}${params.user_ip}${params.merchant_oid}${params.email}${params.payment_amount}${params.user_basket}${params.no_installment}${params.max_installment}${params.currency}${params.test_mode}${PAYTR_CONFIG.merchantSalt}`;

  // Generate hash
  return crypto
    .createHmac('sha256', PAYTR_CONFIG.merchantKey)
    .update(hashStr)
    .digest('base64');
};

// Create payment token
export const createPaymentToken = async ({
  orderId,
  amount,
  email,
  userBasket,
  userIp,
  currency = 'TL',
  testMode = '1',
  noInstallment = '1',
  maxInstallment = '1',
  callbackUrl,
}) => {
  try {
    // Validate required fields
    if (!orderId || !amount || !email || !userBasket || !userIp || !callbackUrl) {
      throw new Error('Missing required parameters');
    }

    // Validate merchant configuration
    if (!PAYTR_CONFIG.merchantId || !PAYTR_CONFIG.merchantKey || !PAYTR_CONFIG.merchantSalt) {
      throw new Error('Missing PayTR merchant configuration');
    }

    // Format basket for PayTR
    const basketItems = userBasket.map(item => [
      item.name,
      (parseFloat(item.price) * 100).toFixed(0),
      item.quantity
    ]);
    const basketStr = JSON.stringify(basketItems);
    const basketBase64 = Buffer.from(basketStr).toString('base64');

    // Convert amount to kuruş (1 TL = 100 kuruş) and ensure it's an integer
    const paymentAmount = Math.round(parseFloat(amount) * 100).toString();

    // Use a real IP if ::1 is provided
    const clientIp = userIp === '::1' ? '127.0.0.1' : userIp;

    // Prepare parameters with strict type checking
    const params = {
      merchant_id: PAYTR_CONFIG.merchantId,
      user_ip: clientIp,
      merchant_oid: orderId,
      email: email,
      user_name: email.split('@')[0],
      user_address: 'Türkiye',
      user_phone: '05000000000',
      payment_amount: paymentAmount,
      user_basket: basketBase64,
      currency: currency,
      test_mode: testMode,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      merchant_ok_url: 'https://www.eraslanmedya.com/dashboard/orders/success',
      merchant_fail_url: 'https://www.eraslanmedya.com/dashboard/orders/fail',
      debug_on: '1',
      timeout_limit: '30',
      lang: 'tr'
    };

    // Generate token
    params.paytr_token = generatePaytrHash(params);

    // Convert params to URLSearchParams
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Make API request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout

    try {
      console.log('PayTR Request Parameters:', params);

      const response = await fetch(PAYTR_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        signal: controller.signal
      });

      const data = await response.json();
      console.log('PayTR API Response:', data);
      
      if (data.status === 'success') {
        return {
          status: 'success',
          token: data.token
        };
      } else {
        throw new Error(data.reason || 'PayTR token creation failed');
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error('PayTR token creation error:', error);
    if (error.name === 'AbortError') {
      throw new Error('PayTR API request timeout');
    }
    throw error;
  }
};

// Verify payment callback
export const verifyPaymentCallback = (params) => {
  try {
    const { merchant_oid, status, total_amount, hash } = params;
    
    // Generate hash for verification
    const hashStr = PAYTR_CONFIG.merchantId +
      merchant_oid +
      total_amount +
      PAYTR_CONFIG.merchantSalt;

    const calculatedHash = crypto
      .createHmac('sha256', PAYTR_CONFIG.merchantKey)
      .update(hashStr)
      .digest('base64');

    // Verify hash
    if (hash === calculatedHash) {
      return {
        status: status === 'success' ? 'success' : 'failed',
        orderId: merchant_oid,
        amount: parseFloat(total_amount) / 100 // Convert from kuruş to TL
      };
    }
    
    return {
      status: 'failed',
      error: 'Invalid hash'
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
}; 