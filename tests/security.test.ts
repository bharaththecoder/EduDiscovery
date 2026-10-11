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

describe('Security Hardening: Recommendation IDOR Prevention (SEC-02)', () => {
  let recommendHandler: any;

  beforeEach(async () => {
    vi.resetModules();
    firestoreDocReads.length = 0;
    mockVerifyIdToken.mockReset();
    const mod = await import('../api/recommend.js');
    recommendHandler = mod.default;
  });

  const dummyUniversities = [
    { id: 'col-1', name: 'College 1', city: 'Vijayawada', tags: ['CSE'], avgPackage: 500000, branchFees: { CSE: 70000 } },
    { id: 'col-2', name: 'College 2', city: 'Guntur', tags: ['ECE'], avgPackage: 450000, branchFees: { ECE: 60000 } }
  ];

  it('ignores caller-supplied userId and does NOT read private records without valid token', async () => {
    const { req, res, getResult } = mockReqRes({
      body: {
        userId: 'victim_user_private_id', // Attack payload attempting IDOR
        universities: dummyUniversities
      }
    });

    await recommendHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(200);
    expect(result.json.recommendations).toBeDefined();

    // Verify Firestore was NOT queried for the attacker-supplied userId
    const victimRead = firestoreDocReads.find(path => path.includes('victim_user_private_id'));
    expect(victimRead).toBeUndefined();
  });

  it('rejects invalid or malformed bearer token with 401 instead of silent degradation', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Decoding Firebase ID token failed.'));

    const { req, res, getResult } = mockReqRes({
      headers: { authorization: 'Bearer forged_or_corrupt_token' },
      body: { universities: dummyUniversities }
    });

    await recommendHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(401);
    expect(result.json.error).toContain('Invalid or expired');
  });

  it('rejects malformed authorization header with 401', async () => {
    const { req, res, getResult } = mockReqRes({
      headers: { authorization: 'Basic dXNlcjpwYXNz' },
      body: { universities: dummyUniversities }
    });

    await recommendHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(401);
    expect(result.json.error).toContain('Malformed authorization header');
  });

  it('derives UID strictly from verified token and queries only verified user records', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'alice_verified_uid',
      email: 'alice@example.com'
    });

    const { req, res, getResult } = mockReqRes({
      headers: { authorization: 'Bearer alice_valid_token' },
      body: {
        userId: 'attacker_attempt_bob', // Should be ignored
        universities: dummyUniversities
      }
    });

    await recommendHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(200);

    // Verify Alice's profile was read, but NOT Bob's
    expect(firestoreDocReads).toContain('user_activity/alice_verified_uid');
    expect(firestoreDocReads.find(p => p.includes('attacker_attempt_bob'))).toBeUndefined();
  });
});
