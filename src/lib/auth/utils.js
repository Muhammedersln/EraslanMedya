import jwt from 'jsonwebtoken';

export async function getUser(req) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
} 