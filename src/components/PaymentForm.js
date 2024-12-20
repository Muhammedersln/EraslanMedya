'use client';

import { createElement, useState } from 'react';

export default function PaymentForm({ amount, orderId, email, products }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Format basket for PayTR
      const userBasket = products.map(product => [
        product.name,
        product.price,
        product.quantity
      ]);

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          email,
          userBasket,
          callbackUrl: `${window.location.origin}/api/payment/callback`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ödeme başlatılırken bir hata oluştu');
      }

      // Create iframe form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.paytr.com/odeme/guvenli/' + data.token;
      form.target = 'paytr_iframe';
      document.body.appendChild(form);

      // Submit form to open iframe
      form.submit();
      document.body.removeChild(form);

    } catch (err) {
      setError(err.message);
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create elements using createElement
  const containerProps = {
    className: 'max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'
  };

  const titleProps = {
    className: 'text-2xl font-bold mb-4'
  };

  const infoContainerProps = {
    className: 'mb-4'
  };

  const amountTextProps = {
    className: 'text-gray-600'
  };

  const orderIdTextProps = {
    className: 'text-gray-600'
  };

  const errorProps = error ? {
    className: 'mb-4 p-3 bg-red-100 text-red-700 rounded'
  } : null;

  const buttonProps = {
    onClick: handlePayment,
    disabled: loading,
    className: 'w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300'
  };

  const iframeProps = {
    src: '',
    name: 'paytr_iframe',
    id: 'paytr_iframe',
    className: 'w-full min-h-[400px] mt-4 border-0',
    frameBorder: '0',
    scrolling: 'no'
  };

  return createElement('div', containerProps, [
    createElement('h2', titleProps, 'Ödeme Bilgileri'),
    createElement('div', infoContainerProps, [
      createElement('p', amountTextProps, `Sipariş Tutarı: ${amount} TL`),
      createElement('p', orderIdTextProps, `Sipariş No: ${orderId}`)
    ]),
    error && createElement('div', errorProps, error),
    createElement('button', buttonProps, loading ? 'İşleniyor...' : 'Ödemeyi Başlat'),
    createElement('iframe', iframeProps)
  ]);
} 