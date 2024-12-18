import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { adminAuth } from '@/lib/middleware/auth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function GET(request, context) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const params = await context.params;
    const id = params.id;
    
    const product = await Product.findById(id);
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

export async function PUT(request, context) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const params = await context.params;
    const id = params.id;
    
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
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Handle image upload if new image is provided
    let filename = existingProduct.image;
    if (image) {
      // Delete old image if it exists
      if (existingProduct.image) {
        try {
          await unlink(path.join(process.cwd(), 'public', 'uploads', existingProduct.image));
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Upload new image
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      filename = `${Date.now()}-${image.name}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await writeFile(path.join(uploadDir, filename), buffer);
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        subCategory,
        minQuantity,
        maxQuantity,
        active,
        image: filename
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

export async function DELETE(request, context) {
  try {
    const user = await adminAuth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const params = await context.params;
    const id = params.id;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product image if it exists
    if (product.image) {
      try {
        await unlink(path.join(process.cwd(), 'public', 'uploads', product.image));
      } catch (error) {
        console.error('Error deleting product image:', error);
      }
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 