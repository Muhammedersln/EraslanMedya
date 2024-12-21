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
    const productId = new URL(request.url).pathname.split('/').pop();
    
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const productId = new URL(request.url).pathname.split('/').pop();
    
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
    if (!name || !price || !category || !subCategory || !minQuantity || !maxQuantity) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Handle image upload if new image is provided
    let imageUrl = existingProduct.imageUrl;
    let imagePublicId = existingProduct.imagePublicId;

    if (image) {
      try {
        // Delete old image from Cloudinary if it exists
        if (existingProduct.imagePublicId) {
          await cloudinary.uploader.destroy(existingProduct.imagePublicId);
        }

        // Upload new image to Cloudinary
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
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return NextResponse.json(
          { message: 'Error uploading image' },
          { status: 500 }
        );
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        category,
        subCategory,
        minQuantity,
        maxQuantity,
        active,
        imageUrl,
        imagePublicId
      },
      { new: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

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
    const productId = new URL(request.url).pathname.split('/').pop();
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }
    
    // Delete product from database
    await Product.findByIdAndDelete(productId);
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Error deleting product', error: error.message },
      { status: 500 }
    );
  }
} 