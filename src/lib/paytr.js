// PayTR API Configuration
const PAYTR_CONFIG = {
  merchantId: process.env.PAYTR_MERCHANT_ID,
  merchantKey: process.env.PAYTR_MERCHANT_KEY,
  merchantSalt: process.env.PAYTR_MERCHANT_SALT,
  apiUrl: 'https://www.paytr.com/odeme/api/get-token',
};

// Helper function to generate hash
const generatePaytrHash = (params) => {
  const crypto = require('crypto');
  const hashStr = `${PAYTR_CONFIG.merchantId}${params.user_ip}${params.merchant_oid}${params.email}${params.payment_amount}${params.user_basket}${params.no_installment}${params.max_installment}${params.currency}${params.test_mode}${PAYTR_CONFIG.merchantSalt}`;
  return crypto.createHmac('sha256', PAYTR_CONFIG.merchantKey).update(hashStr).digest('base64');
};

// Create payment token
export const createPaymentToken = async ({
  orderId,
  amount,
  email,
  userBasket,
  userIp,
  currency = 'TL',
  testMode = '0',
  noInstallment = '0',
  maxInstallment = '0',
  callbackUrl,
}) => {
  try {
    const params = {
      merchant_id: PAYTR_CONFIG.merchantId,
      user_ip: userIp,
      merchant_oid: orderId,
      email: email,
      payment_amount: amount, // amount should be in cents/kuruş
      currency: currency,
      test_mode: testMode,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      merchant_ok_url: callbackUrl + '/success',
      merchant_fail_url: callbackUrl + '/fail',
      user_basket: JSON.stringify(userBasket),
      debug_on: '1',
      timeout_limit: '30',
      lang: 'tr',
    };

    params.paytr_token = generatePaytrHash(params);

    const response = await fetch(PAYTR_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('PayTR token creation error:', error);
    throw error;
  }
};

// Verify payment callback
export const verifyPaymentCallback = (params) => {
  const { merchant_oid, status, total_amount, hash } = params;
  
  // Generate hash for verification
  const hashStr = `${PAYTR_CONFIG.merchantId}${merchant_oid}${total_amount}${PAYTR_CONFIG.merchantSalt}`;
  const calculatedHash = crypto
    .createHmac('sha256', PAYTR_CONFIG.merchantKey)
    .update(hashStr)
    .digest('base64');

  // Verify hash
  if (hash === calculatedHash) {
    return {
      isValid: true,
      orderId: merchant_oid,
      status: status === 'success',
      amount: total_amount,
    };
  }

  return { isValid: false };
}; 