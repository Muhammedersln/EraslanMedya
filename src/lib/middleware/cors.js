import { NextResponse } from 'next/server';

export function corsMiddleware(request) {
  // CORS başlıklarını ayarla
  const headers = new Headers(request.headers);
  
  // Tüm originlere izin ver (production'da değiştirilmeli)
  headers.set('Access-Control-Allow-Origin', '*');
  
  // İzin verilen metodlar
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  
  // İzin verilen başlıklar
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Credentials'a izin ver
  headers.set('Access-Control-Allow-Credentials', 'true');
  
  // OPTIONS isteklerini yanıtla
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  // Diğer istekler için başlıkları ekle
  const response = NextResponse.next();
  response.headers = headers;
  
  return response;
} 