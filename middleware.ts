import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for edge runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_AI = 10; // 10 requests per minute for AI routes
const MAX_REQUESTS_GENERAL = 60; // 60 requests per minute for other API routes

// Deterministic cleanup counter (replaces Math.random())
let requestCounter = 0;

function isRateLimited(ip: string, limit: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count++;
  return record.count > limit;
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

// Constant-time string comparison for edge runtime (no crypto module available)
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let result = a.length ^ b.length;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return result === 0;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Extract hostname from a URL string safely
function getHostname(urlStr: string): string | null {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return null;
  }
}

// Security headers applied to all responses
const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.perplexity.ai https://vercel.live wss://vercel.live",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
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
    if (expectedSecret && apiSecret && timingSafeCompare(apiSecret, expectedSecret)) {
      return true;
    }
    return false;
  }

  const checkUrl = origin || referer || '';
  const checkHostname = getHostname(checkUrl);

  if (!checkHostname) {
    return false;
  }

  // Allow localhost for development
  if (checkHostname === 'localhost' || checkHostname === '127.0.0.1') {
    return true;
  }

  // Allow requests from the Vercel deployment URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && checkHostname === vercelUrl) {
    return true;
  }

  // Allow requests from any *.vercel.app subdomain for this project
  if (checkHostname.endsWith('.vercel.app')) {
    // Extract the project name from VERCEL_URL (e.g., "bos-2-0-xxx.vercel.app" -> "bos-2")
    const projectPrefix = vercelUrl?.split('-').slice(0, 2).join('-');
    if (projectPrefix && checkHostname.startsWith(projectPrefix)) {
      return true;
    }
    // Also allow if VERCEL_PROJECT_PRODUCTION_URL matches
    const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (prodUrl && checkHostname === prodUrl) {
      return true;
    }
  }

  // Allow custom domain if set
  const customDomain = process.env.NEXT_PUBLIC_APP_URL;
  if (customDomain) {
    const customHostname = getHostname(customDomain);
    if (customHostname && checkHostname === customHostname) {
      return true;
    }
  }

  // Check API secret header as fallback
  const apiSecret = request.headers.get('x-api-secret');
  const expectedSecret = process.env.API_ROUTE_SECRET;
  if (expectedSecret && apiSecret && timingSafeCompare(apiSecret, expectedSecret)) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Deterministic cleanup every 100 requests + hard cap
  requestCounter++;
  if (requestCounter % 100 === 0) {
    cleanupRateLimitMap();
  }
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }

  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  // Check if this is a protected API route (AI-powered, expensive)
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

    // Rate limit AI routes (stricter limit)
    if (isRateLimited(ip, MAX_REQUESTS_AI)) {
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
  } else if (pathname.startsWith('/api/')) {
    // Rate limit all other API routes at the general limit
    if (isRateLimited(`${ip}:general`, MAX_REQUESTS_GENERAL)) {
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
