import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for edge runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute for AI routes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count++;
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

// Periodically clean up expired entries to prevent memory leaks
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Security headers applied to all responses
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Routes that are expensive (AI-powered) and need protection
const PROTECTED_ROUTES = ['/api/chat', '/api/suggestions'];

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow requests with no origin (same-origin requests from browser, curl without origin)
  // But still rate-limit them
  if (!origin && !referer) {
    // Check for API secret as an alternative auth method
    const apiSecret = request.headers.get('x-api-secret');
    const expectedSecret = process.env.API_ROUTE_SECRET;
    if (expectedSecret && apiSecret === expectedSecret) {
      return true;
    }
    return false;
  }

  const checkUrl = origin || referer || '';

  // Allow localhost for development
  if (checkUrl.includes('localhost') || checkUrl.includes('127.0.0.1')) {
    return true;
  }

  // Allow requests from the Vercel deployment URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && checkUrl.includes(vercelUrl)) {
    return true;
  }

  // Allow requests from any *.vercel.app subdomain for this project
  // This covers preview deployments
  if (checkUrl.includes('.vercel.app')) {
    // Extract the project name from VERCEL_URL (e.g., "bos-2-0-xxx.vercel.app" -> "bos-2")
    const projectPrefix = vercelUrl?.split('-').slice(0, 2).join('-');
    if (projectPrefix && checkUrl.includes(projectPrefix)) {
      return true;
    }
    // Also allow if VERCEL_PROJECT_PRODUCTION_URL matches
    const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (prodUrl && checkUrl.includes(prodUrl)) {
      return true;
    }
  }

  // Allow custom domain if set
  const customDomain = process.env.NEXT_PUBLIC_APP_URL;
  if (customDomain && checkUrl.includes(new URL(customDomain).hostname)) {
    return true;
  }

  // Check API secret header as fallback
  const apiSecret = request.headers.get('x-api-secret');
  const expectedSecret = process.env.API_ROUTE_SECRET;
  if (expectedSecret && apiSecret === expectedSecret) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clean up rate limit map periodically (every ~100 requests)
  if (Math.random() < 0.01) {
    cleanupRateLimitMap();
  }

  // Check if this is a protected API route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check origin/referer
    if (!isAllowedOrigin(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Invalid origin' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        }
      );
    }

    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            ...securityHeaders,
          },
        }
      );
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match page routes for security headers (exclude static files)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
