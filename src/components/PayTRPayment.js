'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function PayTRPayment({ orderDetails, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Kullanıcı IP'sini al
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();

        // PayTR token'ı al
        const response = await fetch('/api/payment/paytr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderDetails,
            userInfo: {
              email: orderDetails.email,
              ip
            }
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ödeme başlatılamadı');
        }

        // PayTR iFrame'i yükle
        if (data.token) {
          // iFrame Resizer scriptini yükle
          await loadScript('https://www.paytr.com/js/iframeResizer.min.js');
          
          const iframeContainer = document.getElementById('paytr-iframe-container');
          if (iframeContainer) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.paytr.com/odeme/guvenli/${data.token}`;
            iframe.frameBorder = '0';
            iframe.style.width = '100%';
            iframeContainer.innerHTML = '';
            iframeContainer.appendChild(iframe);
            
            // @ts-ignore
            if (window.iFrameResize) {
              // @ts-ignore
              window.iFrameResize({}, '#paytr-iframe-container iframe');
            }
            
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Payment error:', error);
        setError(error.message);
        setLoading(false);
        toast.error(error.message);
      }
    };

    // Script yükleme yardımcı fonksiyonu
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    initializePayment();
  }, [orderDetails]);

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Kapat
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <div id="paytr-iframe-container" className="min-h-[600px]"></div>
    </div>
  );
} 