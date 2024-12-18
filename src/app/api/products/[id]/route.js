import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import dbConnect from '@/lib/db';

export async function GET(req, context) {
  try {
    await dbConnect();

    // Await the entire params object first
    const params = await context.params;
    const id = params.id;

    // Ensure id exists and is valid
    if (!id) {
      return NextResponse.json(
        { message: 'Ürün ID\'si gerekli' },
        { status: 400 }
      );
    }

    // Find product
    const product = await Product.findById(id).lean();

    // Check if product exists
    if (!product) {
      return NextResponse.json(
        { message: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Check if product is active
    if (!product.active) {
      return NextResponse.json(
        { message: 'Bu ürün artık mevcut değil' },
        { status: 404 }
      );
    }

    // Return product
    return NextResponse.json(product);

  } catch (error) {
    console.error('Product detail error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: 'Geçersiz ürün ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 