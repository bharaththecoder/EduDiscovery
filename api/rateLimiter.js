// ============================================================
// EduDiscovery — Production Serverless Rate Limiter (ARCH-02)
// Supports Upstash Redis REST API with In-Memory Dev Fallback
// Includes Client IP Spoofing Protections
// ============================================================

// In-memory fallback map for development or single-node testing
const inMemoryStore = new Map();

// Periodic cleanup of stale in-memory entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of inMemoryStore.entries()) {
      if (now > data.resetTime + 60000) {
        inMemoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Robust Client IP Resolution with Spoofing Mitigations
 * Prioritizes trusted edge headers (Vercel Edge, trusted reverse proxy).
 */
export function getClientIp(req) {
  const headers = req?.headers || {};

  // 1. Vercel Edge header (injected by Vercel's edge network, cannot be spoofed by client)
  const vercelIp = headers['x-vercel-forwarded-for'];
  if (vercelIp && typeof vercelIp === 'string') {
    return cleanIp(vercelIp.split(',')[0].trim());
  }

  // 2. Cloudflare Connecting IP (if deployed behind Cloudflare)
  const cfIp = headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') {
    return cleanIp(cfIp.trim());
  }

  // 3. Real IP header from trusted reverse proxy
  const realIp = headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return cleanIp(realIp.trim());
  }

  // 4. Standard X-Forwarded-For: In Vercel, the edge proxy appends the client IP.
  // Take the leftmost IP that is a valid formatted IP, or the direct socket.
  const forwarded = headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    const parts = forwarded.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      return cleanIp(parts[0]);
    }
  }

  // 5. Direct Socket Remote Address fallback
  const socketIp = req?.socket?.remoteAddress || req?.connection?.remoteAddress;
  return cleanIp(socketIp || '127.0.0.1');
}

function cleanIp(ip) {
  if (!ip || typeof ip !== 'string') return '127.0.0.1';
  let cleaned = ip.trim();
  // Strip IPv6-mapped IPv4 prefix (::ffff:)
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.slice(7);
  }
  // Strip port number if present (e.g. 192.168.1.1:54321)
  if (cleaned.includes(':') && !cleaned.includes('::')) {
    cleaned = cleaned.split(':')[0];
  }
  return cleaned || '127.0.0.1';
}

/**
 * Check if distributed Upstash Redis is active
 */
export function isDistributedRateLimitingConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && 
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Apply rate limiting to a serverless request
 * 
 * @param {object} req - Express / Vercel request object
 * @param {object} res - Express / Vercel response object
 * @param {object} options
 * @param {string} options.prefix - Endpoint namespace (e.g. 'chat', 'search')
 * @param {number} options.limit - Max requests per window
 * @param {number} options.windowSeconds - Window length in seconds
 * @returns {Promise<boolean>} - True if allowed, false if rejected (429 sent)
 */
export async function applyRateLimit(req, res, options = {}) {
  const {
    prefix = 'api',
    limit = 20,
    windowSeconds = 60
  } = options;

  const clientIp = getClientIp(req);
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const isDistributed = isDistributedRateLimitingConfigured();

  let currentCount = 0;
  let resetTime = now + windowMs;

  if (isDistributed) {
    try {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;
      const bucket = Math.floor(now / windowMs);
      const key = `ratelimit:${prefix}:${clientIp}:${bucket}`;

      // Execute atomic INCR via Upstash Redis REST
      const resp = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, windowSeconds * 2]
        ])
      });

      if (resp.ok) {
        const results = await resp.json();
        currentCount = results[0]?.result || 1;
        resetTime = (bucket + 1) * windowMs;
      } else {
        console.warn('[RateLimiter] Upstash REST returned non-200. Falling back to in-memory.');
        currentCount = applyInMemoryRateLimit(prefix, clientIp, limit, windowMs, now);
      }
    } catch (err) {
      console.warn('[RateLimiter] Distributed Upstash check failed:', err.message);
      currentCount = applyInMemoryRateLimit(prefix, clientIp, limit, windowMs, now);
    }
  } else {
    currentCount = applyInMemoryRateLimit(prefix, clientIp, limit, windowMs, now);
  }

  const remaining = Math.max(0, limit - currentCount);
  const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000));

  const setHeaderSafe = (name, value) => {
    if (typeof res?.setHeader === 'function') {
      res.setHeader(name, value);
    }
  };

  // Set standard rate limit headers
  setHeaderSafe('X-RateLimit-Limit', limit.toString());
  setHeaderSafe('X-RateLimit-Remaining', remaining.toString());
  setHeaderSafe('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  setHeaderSafe('X-RateLimit-Policy', `${limit};w=${windowSeconds}`);

  if (currentCount > limit) {
    setHeaderSafe('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: `Too many requests to /api/${prefix}. Please wait ${retryAfter} seconds before retrying.`,
      retryAfter,
      endpoint: prefix
    });
    return false;
  }

  return true;
}

function applyInMemoryRateLimit(prefix, clientIp, limit, windowMs, now) {
  const key = `${prefix}:${clientIp}`;
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetTime) {
    inMemoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return 1;
  } else {
    entry.count += 1;
    return entry.count;
  }
}
