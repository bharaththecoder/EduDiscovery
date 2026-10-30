import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track Firestore calls to verify user profile isolation
const firestoreDocReads: string[] = [];
const firestoreDocWrites: string[] = [];

// Mock Firebase Admin
const mockVerifyIdToken = vi.fn();
vi.mock('../api/firebaseAdmin.js', () => ({
  default: {
    auth: () => ({
      verifyIdToken: mockVerifyIdToken
    })
  },
  db: {
    collection: (colName: string) => ({
      doc: (docId: string) => ({
        get: async () => {
          firestoreDocReads.push(`${colName}/${docId}`);
          if (colName === 'user_activity' && docId === 'alice_verified_uid') {
            return {
              exists: true,
              data: () => ({
                recentViews: [{ collegeId: 'col-1' }],
                recentSearches: [{ query: 'CSE Vijayawada' }]
              })
            };
          }
          return { exists: false, data: () => ({}) };
        },
        set: async (data: any) => {
          firestoreDocWrites.push(`${colName}/${docId}`);
          return Promise.resolve();
        }
      })
    })
  }
}));

// Helper to simulate Express req/res
function mockReqRes(options: { body?: any; headers?: Record<string, string>; method?: string }) {
  let statusCode = 200;
  let jsonResponse: any = null;

  const req = {
    method: options.method || 'POST',
    body: options.body || {},
    headers: options.headers || {}
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      jsonResponse = data;
      return res;
    }
  };

  return { req, res, getResult: () => ({ status: statusCode, json: jsonResponse }) };
}

describe('Security Hardening: Seed API Access Control (SEC-01)', () => {
  let seedHandler: any;

  beforeEach(async () => {
    vi.resetModules();
    firestoreDocWrites.length = 0;
    mockVerifyIdToken.mockReset();
    process.env.ADMIN_EMAILS = 'superadmin@edudiscovery.com';
    const mod = await import('../api/seed.js');
    seedHandler = mod.default;
  });

  it('rejects unauthenticated request with 403 Forbidden before database writes', async () => {
    const { req, res, getResult } = mockReqRes({
      body: { colleges: [{ id: 'test-1', name: 'Test' }] }
    });

    await seedHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(403);
    expect(result.json.error).toContain('Forbidden');
    expect(firestoreDocWrites.length).toBe(0);
  });

  it('rejects ordinary signed-in user who lacks admin claims with 403 Forbidden', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'regular_student_123',
      email: 'student@gmail.com',
      admin: false
    });

    const { req, res, getResult } = mockReqRes({
      headers: { authorization: 'Bearer valid_student_token' },
      body: { colleges: [{ id: 'test-1', name: 'Test' }] }
    });

    await seedHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(403);
    expect(firestoreDocWrites.length).toBe(0);
  });

  it('rejects requests with invalid or expired ID tokens with 403 Forbidden', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Firebase ID token has expired.'));

    const { req, res, getResult } = mockReqRes({
      headers: { authorization: 'Bearer expired_token' },
      body: { colleges: [{ id: 'test-1', name: 'Test' }] }
    });

    await seedHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(403);
    expect(firestoreDocWrites.length).toBe(0);
  });
});
