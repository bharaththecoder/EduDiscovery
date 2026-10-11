import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getClientIp, applyRateLimit, isDistributedRateLimitingConfigured } from '../api/rateLimiter.js';

function mockReqRes(options: { headers?: Record<string, string>; socketIp?: string } = {}) {
  const req: any = {
    headers: options.headers || {},
    socket: { remoteAddress: options.socketIp || '127.0.0.1' }
  };

  let statusCode = 200;
  let jsonBody: any = null;
  const headersSet: Record<string, string> = {};

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: any) {
      jsonBody = body;
      return res;
    },
    setHeader(name: string, value: string) {
      headersSet[name.toLowerCase()] = value;
      return res;
    }
  };

  return { req, res, getResult: () => ({ status: statusCode, body: jsonBody, headers: headersSet }) };
}

describe('Serverless Rate Limiter (ARCH-02)', () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  describe('Client IP Resolution & Anti-Spoofing', () => {
    it('prioritizes trusted x-vercel-forwarded-for from edge proxy', () => {
      const { req } = mockReqRes({
        headers: {
          'x-vercel-forwarded-for': '203.0.113.195, 10.0.0.1',
          'x-forwarded-for': '1.1.1.1'
        }
      });
      expect(getClientIp(req)).toBe('203.0.113.195');
    });

    it('prioritizes cf-connecting-ip if vercel edge header absent', () => {
      const { req } = mockReqRes({
        headers: {
          'cf-connecting-ip': '198.51.100.42',
          'x-forwarded-for': 'attacker.spoofed.ip'
        }
      });
      expect(getClientIp(req)).toBe('198.51.100.42');
    });

    it('cleans IPv6 mapped IPv4 address prefix (::ffff:)', () => {
      const { req } = mockReqRes({
        headers: {
          'x-real-ip': '::ffff:192.168.1.50'
        }
      });
      expect(getClientIp(req)).toBe('192.168.1.50');
    });

    it('strips port numbers from IP headers', () => {
      const { req } = mockReqRes({
        headers: {
          'x-forwarded-for': '203.0.113.99:54321'
        }
      });
      expect(getClientIp(req)).toBe('203.0.113.99');
    });
  });

  describe('In-Memory Rate Limiting Enforcement', () => {
    it('allows requests within the defined threshold and sets rate limit headers', async () => {
      const testIp = '192.0.2.1';
      const { req, res, getResult } = mockReqRes({ headers: { 'x-real-ip': testIp } });

      const allowed = await applyRateLimit(req, res, { prefix: 'test-allow', limit: 5, windowSeconds: 60 });
      expect(allowed).toBe(true);

      const result = getResult();
      expect(result.status).toBe(200);
      expect(result.headers['x-ratelimit-limit']).toBe('5');
      expect(result.headers['x-ratelimit-remaining']).toBe('4');
      expect(result.headers['x-ratelimit-policy']).toBe('5;w=60');
    });

    it('rejects requests exceeding limit with HTTP 429 and Retry-After header', async () => {
      const testIp = '192.0.2.2';
      const limit = 3;

      // Exhaust limit
      for (let i = 0; i < limit; i++) {
        const { req, res } = mockReqRes({ headers: { 'x-real-ip': testIp } });
        const ok = await applyRateLimit(req, res, { prefix: 'test-exhaust', limit, windowSeconds: 60 });
        expect(ok).toBe(true);
      }

      // Next request must be rejected
      const { req, res, getResult } = mockReqRes({ headers: { 'x-real-ip': testIp } });
      const allowed = await applyRateLimit(req, res, { prefix: 'test-exhaust', limit, windowSeconds: 60 });
      expect(allowed).toBe(false);

      const result = getResult();
      expect(result.status).toBe(429);
      expect(result.body.error).toContain('Too many requests');
      expect(result.headers['retry-after']).toBeDefined();
      expect(result.headers['x-ratelimit-remaining']).toBe('0');
    });
  });

  describe('Distributed Upstash Redis State Detection', () => {
    it('detects missing distributed rate limiter configuration', () => {
      expect(isDistributedRateLimitingConfigured()).toBe(false);
    });

    it('detects when Upstash Redis credentials are fully present', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://fake-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';
      expect(isDistributedRateLimitingConfigured()).toBe(true);
    });
  });
});
