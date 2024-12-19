import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function auth(request) {
  try {
    if (!request?.headers) {
      return null;
    }

    const headers = request.headers;
    const authHeader = await headers.get('authorization');
    
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
    
    if (!user || user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ message: 'Admin access required' }),
        { status: 403 }
      );
    }

    return user;
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: 'Admin authentication failed' }),
      { status: 403 }
    );
  }
} 