import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = await fetch('http://localhost:5000/api/products');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error);
    return NextResponse.json({ error: 'Ürünler yüklenemedi' }, { status: 500 });
  }
} 