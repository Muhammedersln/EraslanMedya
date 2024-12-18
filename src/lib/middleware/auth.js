import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function auth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieStore = await cookies();
    const cookieToken = await cookieStore.get('token');
    const token = cookieToken?.value || (authHeader ? authHeader.split(' ')[1] : null);

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth middleware error:', error);
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