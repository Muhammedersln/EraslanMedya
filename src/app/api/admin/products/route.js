import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { adminAuth } from '@/lib/middleware/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

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
    const formData = await request.formData();
    
    // Extract file and other data
    const image = formData.get('image');
    const name = formData.get('name');
    const description = formData.get('description');
    const price = parseFloat(formData.get('price'));
    const category = formData.get('category');
    const subCategory = formData.get('subCategory');
    const minQuantity = parseInt(formData.get('minQuantity'));
    const maxQuantity = parseInt(formData.get('maxQuantity'));
    const active = formData.get('active') === 'true';

    // Validate required fields
    if (!name || !price || !category || !subCategory || !minQuantity || !maxQuantity || !image) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle image upload
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${image.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      subCategory,
      minQuantity,
      maxQuantity,
      active,
      image: filename
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          message: 'Validation error', 
          errors: validationErrors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 