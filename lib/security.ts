/**
 * Shared security utilities for BOS-2.0 API routes.
 * Provides SSRF prevention, input validation, timing-safe comparison,
 * error sanitization, and safe HTML entity decoding.
 */

// Private IP ranges and internal hostnames to block for SSRF prevention
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.internal',
  '169.254.169.254',
]);

function isPrivateIP(hostname: string): boolean {
  // IPv4 private ranges
  const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 127) return true;                          // 127.0.0.0/8 loopback
    if (a === 10) return true;                           // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true;    // 172.16.0.0/12
    if (a === 192 && b === 168) return true;             // 192.168.0.0/16
    if (a === 169 && b === 254) return true;             // 169.254.0.0/16 link-local
    if (a === 0) return true;                            // 0.0.0.0/8
  }

  // IPv6 loopback and ULA
  const normalized = hostname.replace(/^\[|\]$/g, '');
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // ULA
  if (normalized.startsWith('fe80')) return true; // link-local

  return false;
}

/**
 * Validates a URL for SSRF prevention.
 * Only allows http/https schemes, blocks private IPs and internal hostnames.
 */
export function validateUrl(input: string): { valid: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Only allow http and https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only http and https URLs are allowed' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block known internal hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, error: 'URL points to a blocked host' };
  }

  // Block private IP ranges
  if (isPrivateIP(hostname)) {
    return { valid: false, error: 'URL points to a private IP address' };
  }

  return { valid: true };
}

/**
 * Validates and sanitizes a stock/finance symbol.
 * Only allows alphanumeric, dots, carets, and hyphens (max 10 chars).
 * Returns the sanitized uppercase symbol or null if invalid.
 */
export function validateSymbol(symbol: string): string | null {
  const pattern = /^[A-Za-z0-9.\^-]{1,10}$/;
  if (!pattern.test(symbol)) {
    return null;
  }
  return symbol.toUpperCase();
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Used for comparing API secrets.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to avoid leaking length info via timing
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

/**
 * Strips internal details from error messages before sending to client.
 * Removes file paths, environment variable names, and stack traces.
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Internal server error';
  }

  let message = error.message;

  // Remove file paths (Unix and Windows)
  message = message.replace(/\/[^\s:]+\.[a-z]{1,4}/gi, '[path]');
  message = message.replace(/[A-Z]:\\[^\s:]+\.[a-z]{1,4}/gi, '[path]');

  // Remove environment variable references
  message = message.replace(/\b[A-Z][A-Z0-9_]{2,}\b/g, '[env]');

  // Remove anything that looks like a stack trace line
  message = message.replace(/\s+at\s+.+/g, '');

  // Truncate to reasonable length
  if (message.length > 200) {
    message = message.slice(0, 200);
  }

  return message || 'Internal server error';
}

/**
 * Decodes HTML entities without using DOM innerHTML (XSS-safe).
 * Handles named entities (&amp;, &lt;, &gt;, &quot;, &apos;),
 * decimal entities (&#123;), and hex entities (&#xAB;).
 */
export function decodeHtmlEntities(text: string): string {
  const namedEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': '\u00A0',
    '&ndash;': '\u2013',
    '&mdash;': '\u2014',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&hellip;': '\u2026',
    '&copy;': '\u00A9',
    '&reg;': '\u00AE',
    '&trade;': '\u2122',
  };

  return text.replace(/&(?:#x([0-9a-fA-F]+)|#(\d+)|(\w+));/g, (match, hex, dec, named) => {
    if (hex) {
      return String.fromCodePoint(parseInt(hex, 16));
    }
    if (dec) {
      return String.fromCodePoint(parseInt(dec, 10));
    }
    if (named) {
      const key = `&${named};`;
      return namedEntities[key] ?? match;
    }
    return match;
  });
}
