import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { adminAuth } from '@/lib/middleware/auth';

// Ayarları getir
export async function GET() {
  try {
    await dbConnect();
    
    let settings = await Settings.findOne();
    
    // Eğer ayarlar yoksa, varsayılan değerlerle oluştur
    if (!settings) {
      settings = await Settings.create({
        taxRate: 0.18
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Ayarlar getirilirken hata:", error);
    return NextResponse.json(
      { error: "Ayarlar getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Ayarları güncelle
export async function POST(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { taxRate } = await request.json();

    // Vergi oranı kontrolü
    if (typeof taxRate !== "number" || taxRate < 0 || taxRate > 1) {
      return NextResponse.json(
        { error: "Geçersiz vergi oranı. 0 ile 1 arasında bir değer girin" },
        { status: 400 }
      );
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({ taxRate });
    } else {
      settings.taxRate = taxRate;
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Ayarlar güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Ayarlar güncellenirken bir hata oluştu" },
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