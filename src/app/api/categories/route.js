import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/categories`);
    const categories = await response.json();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Kategori çekme hatası:', error);
    return NextResponse.json(
      { error: 'Kategoriler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 