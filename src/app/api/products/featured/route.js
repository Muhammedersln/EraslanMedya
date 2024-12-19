import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    // Önce tüm benzersiz ana kategorileri bulalım
    const mainCategories = await Product.distinct('category');
    
    // Her ana kategori için sub kategorileri bulup, her sub kategoriden 2 ürün çekelim
    const featuredProducts = await Promise.all(
      mainCategories.map(async (mainCategory) => {
        // Her ana kategori için sub kategorileri bulalım
        const subCategories = await Product.distinct('subCategory', { 
          category: mainCategory 
        });
        
        // Her sub kategoriden 2'şer ürün alalım
        const subCategoryProducts = await Promise.all(
          subCategories.map(async (subCategory) => {
            const products = await Product.find({
              category: mainCategory,
              subCategory: subCategory
            })
              .sort({ createdAt: -1 })
              .limit(2);
            return products;
          })
        );

        return subCategoryProducts.flat();
      })
    );

    // Tüm ürünleri tek bir array'de toplayalım
    const flattenedProducts = featuredProducts.flat();

    return NextResponse.json(flattenedProducts);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 