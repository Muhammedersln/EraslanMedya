import { NextResponse } from 'next/server';

export function errorHandler(error) {
  // Mongoose validation hatası
  if (error.name === 'ValidationError') {
    return NextResponse.json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map(e => e.message)
    }, { status: 400 });
  }

  // JWT hatası
  if (error.name === 'JsonWebTokenError') {
    return NextResponse.json({
      message: 'Invalid token'
    }, { status: 401 });
  }

  // Genel hata
  return NextResponse.json({
    message: error.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? error : {}
  }, { status: error.status || 500 });
} 