import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function auth(request) {
  try {
    if (!request?.headers) {
      return null;
    }

    const headersList = await request.headers;
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function adminAuth(request) {
  try {
    const user = await auth(request);
    
    if (!user) {
      return null;
    }

    if (user.role !== 'admin') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
} 