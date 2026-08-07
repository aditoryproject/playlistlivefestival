interface RateLimitStore {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitStore>();

// Cleanup stale rate limit entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, store] of memoryStore.entries()) {
      if (now > store.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * In-Memory Rate Limiter to prevent Brute-Force & DDoS API Spam
 * @param key Unique key e.g. "auth_192.168.1.1"
 * @param maxHits Max allowed requests in timeframe
 * @param windowMs Timeframe in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxHits: number = 10,
  windowMs: number = 60 * 1000
): { success: boolean; limit: number; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitStore = {
      count: 1,
      resetTime: now + windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      success: true,
      limit: maxHits,
      remaining: maxHits - 1,
      resetMs: windowMs,
    };
  }

  if (record.count >= maxHits) {
    return {
      success: false,
      limit: maxHits,
      remaining: 0,
      resetMs: record.resetTime - now,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: maxHits,
    remaining: maxHits - record.count,
    resetMs: record.resetTime - now,
  };
}

/**
 * Get client IP address from Next.js request headers
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
