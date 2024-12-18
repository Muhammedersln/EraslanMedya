import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const rateLimit = new Map();

// Her IP için istek sayısını ve son istek zamanını tut
const WINDOW_SIZE = 60 * 1000; // 1 dakika
const MAX_REQUESTS = 100; // 1 dakikada maksimum 100 istek

export async function rateLimiter(request) {
  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const userRequests = rateLimit.get(ip) || { count: 0, firstRequest: now };

    // Zaman penceresi dışındaysa sıfırla
    if (now - userRequests.firstRequest > WINDOW_SIZE) {
      userRequests.count = 0;
      userRequests.firstRequest = now;
    }

    // İstek sayısını artır
    userRequests.count++;
    rateLimit.set(ip, userRequests);

    // Limit aşıldıysa hata döndür
    if (userRequests.count > MAX_REQUESTS) {
      return NextResponse.json({
        message: 'Too many requests, please try again later.'
      }, { status: 429 });
    }

    return null;
  } catch (error) {
    console.error('Rate limiter error:', error);
    return null; // Rate limiter hatası durumunda isteği engelleme
  }
} 