import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// JWT secret'ı Uint8Array'e çevir
const secret = new TextEncoder().encode(process.env.JWT_SECRET || '')

export async function middleware(request) {
  try {
    // Admin sayfaları için kontrol
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Token kontrolü
      const token = request.cookies.get('token')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '') ||
                   request.headers.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      try {
        // Token doğrulama (jose kütüphanesi ile)
        const { payload } = await jwtVerify(token, secret);

        if (!payload || !payload.role) {
          return NextResponse.redirect(new URL('/login', request.url));
        }

        if (payload.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        // Token geçerli ve admin yetkisi var, devam et
        const response = NextResponse.next();
        response.headers.set('x-user-role', payload.role);
        return response;

      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
  ]
} 