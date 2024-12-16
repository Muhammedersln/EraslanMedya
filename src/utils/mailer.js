export const sendVerificationEmail = async (to, token) => {
  try {
    const response = await fetch('/api/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: to, 
        token,
        verificationLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(to)}`
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}; 