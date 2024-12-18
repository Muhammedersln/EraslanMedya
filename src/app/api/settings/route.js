import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';

// Get settings
export async function GET(request) {
  try {
    await dbConnect();
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Varsayılan ayarları oluştur
      settings = new Settings({
        taxRate: 0.18,
        updatedAt: new Date()
      });
      await settings.save();
    }

    return NextResponse.json({
      taxRate: settings.taxRate || 0.18
    });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json(
      { taxRate: 0.18 },
      { status: 200 }
    );
  }
}

// Update settings
export async function POST(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const data = await request.json();

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(data);
    } else {
      Object.assign(settings, data);
    }

    settings.updatedAt = new Date();
    await settings.save();

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Get tax rate
export async function PATCH(request) {
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    
    if (!settings) {
      return NextResponse.json(
        { message: 'Settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ taxRate: settings.taxRate });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 