import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { adminAuth } from '@/lib/middleware/auth';

// Get all users
export async function GET(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const users = await User.find().select('-password').sort('-createdAt');

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Update user
export async function PATCH(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const updateData = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 