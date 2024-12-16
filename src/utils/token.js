const SECRET_KEY = process.env.TOKEN_SECRET || 'your-secret-key';

export const generateVerificationToken = (email) => {
  const timestamp = new Date().getTime();
  const token = Buffer.from(JSON.stringify({
    email,
    timestamp,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
  })).toString('base64');
  
  return token;
};

export const verifyToken = (token) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const { email, timestamp, exp } = decoded;
    
    // Check if token is expired
    if (exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, email: null };
    }
    
    // Check if token is older than 24 hours
    const tokenTime = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - tokenTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours > 24) {
      return { valid: false, email: null };
    }
    
    return { valid: true, email };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, email: null };
  }
}; 