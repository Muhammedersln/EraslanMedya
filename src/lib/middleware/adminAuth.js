import { NextResponse } from 'next/server';
import { auth } from '@/lib/middleware/auth';

export async function adminAuth(request) {
  try {
    const user = await auth(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    return user;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 