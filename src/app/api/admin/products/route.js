import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { adminAuth } from '@/lib/middleware/auth';
import { cloudinary } from '@/utils/cloudinary';

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
    
    // Extract data
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

    try {
      // Upload image to Cloudinary
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'products',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Write buffer to stream
        const bufferStream = require('stream').Readable.from(buffer);
        bufferStream.pipe(uploadStream);
      });

      const result = await uploadPromise;

      // Create product with Cloudinary data
      const product = await Product.create({
        name,
        description,
        price,
        category,
        subCategory,
        minQuantity,
        maxQuantity,
        active,
        imageUrl: result.secure_url,
        imagePublicId: result.public_id
      });

      return NextResponse.json(product, { status: 201 });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return NextResponse.json(
        { message: 'Error uploading image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 