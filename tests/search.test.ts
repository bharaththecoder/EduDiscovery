import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock test colleges
const testColleges = [
  {
    id: 'col-a',
    name: 'Andhra Tech Institute',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    branchFees: { 'CSE': 60000, 'ECE': 60000 },
    branches: ['CSE', 'ECE'],
    programs: [{ name: 'B.Tech CSE', fees: '₹60,000' }],
    tags: ['Autonomous', 'Affordable'],
    avgPackage: 600000,
    placementRate: 85,
    naac: 'A+'
  },
  {
    id: 'col-b',
    name: 'Krishna Engineering College',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    branchFees: { 'CSE': 70000 },
    branches: ['CSE'],
    programs: [{ name: 'B.Tech CSE', fees: '₹70,000' }],
    tags: ['Affiliated'],
    avgPackage: 550000,
    placementRate: 80,
    naac: 'A'
  },
  {
    id: 'col-c',
    name: 'Guntur Science & Tech',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    branchFees: { 'Mechanical': 72000, 'Civil': 72000 },
    branches: ['Mechanical', 'Civil'],
    programs: [{ name: 'B.Tech Civil', fees: '₹72,000' }],
    tags: ['Core Engineering'],
    avgPackage: 500000,
    placementRate: 75,
    naac: 'A'
  },
  {
    id: 'col-d',
    name: 'Vijayawada Premier Institute',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    branchFees: { 'CSE': 120000, 'AI': 130000 },
    branches: ['CSE', 'AI'],
    programs: [{ name: 'B.Tech CSE', fees: '₹1,20,000' }],
    tags: ['Top Ranked'],
    avgPackage: 900000,
    placementRate: 92,
    naac: 'A++'
  },
  {
    id: 'col-e',
    name: 'Vizag Institute of Science',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    branchFees: { 'CSE': 200000 },
    branches: ['CSE'],
    programs: [{ name: 'B.Tech CSE', fees: '₹2,00,000' }],
    tags: ['Private University'],
    avgPackage: 1100000,
    placementRate: 95,
    naac: 'A++'
  }
];

// Mock firebaseAdmin and aiHelper
vi.mock('../api/firebaseAdmin.js', () => ({
  default: {},
  db: {
    collection: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({
        docs: testColleges.map(c => ({
          id: c.id,
          data: () => ({ ...c })
        }))
      })
    })
  }
}));

vi.mock('../api/aiHelper.js', () => ({
  generateText: vi.fn().mockResolvedValue('Mocked AI analysis explaining college choice.')
}));

// Helper to simulate Express req/res
function mockReqRes(body: Record<string, unknown>, method = 'POST') {
  let statusCode = 200;
  let jsonResponse: any = null;

  const req = {
    method,
    body
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

describe('Search API Query Validation and Strict Constraint Filtering', () => {
  let searchHandler: any;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../api/search.js');
    searchHandler = mod.default;
  });

  it('rejects empty query with HTTP 400', async () => {
    const { req, res, getResult } = mockReqRes({ query: '' });
    await searchHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(400);
    expect(result.json.error).toContain('non-empty');
  });

  it('rejects whitespace-only query with HTTP 400', async () => {
    const { req, res, getResult } = mockReqRes({ query: '    \n  \t  ' });
    await searchHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(400);
    expect(result.json.error).toContain('non-empty');
  });

  it('returns zero results with clear explanation when no colleges satisfy budget (never falls back to expensive)', async () => {
    // Budget under 50k: none in test dataset qualify
    const { req, res, getResult } = mockReqRes({
      query: 'colleges in Andhra',
      budget: 'under ₹75k',
      city: 'Visakhapatnam' // Only college in Vizag costs 200,000
    });
    await searchHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(200);
    expect(result.json.results).toEqual([]);
    expect(result.json.reasoning).toContain('meet all of your specified criteria');
  });

  it('returns exactly ONE matching college when constrained to Guntur under 75k', async () => {
    const { req, res, getResult } = mockReqRes({
      query: 'civil engineering colleges in Guntur',
      budget: 'under ₹75k',
      city: 'Guntur'
    });
    await searchHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(200);
    expect(result.json.results.length).toBe(1);
    expect(result.json.results[0].id).toBe('col-c');
  });

  it('returns exactly TWO matching colleges for Vijayawada CSE under 75k', async () => {
    const { req, res, getResult } = mockReqRes({
      query: 'CSE colleges',
      budget: 'under ₹75k',
      branch: 'CSE',
      city: 'Vijayawada'
    });
    await searchHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(200);
    expect(result.json.results.length).toBe(2);
    const matchedIds = result.json.results.map((r: any) => r.id).sort();
    expect(matchedIds).toEqual(['col-a', 'col-b']);
  });

  it('returns THREE or more matching colleges when unconstrained by budget for CSE', async () => {
    const { req, res, getResult } = mockReqRes({
      query: 'Top CSE engineering institutes',
      branch: 'CSE'
    });
    await searchHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(200);
    // col-a, col-b, col-d, col-e all offer CSE
    expect(result.json.results.length).toBeGreaterThanOrEqual(3);
    const matchedIds = result.json.results.map((r: any) => r.id);
    expect(matchedIds).toContain('col-d');
    expect(matchedIds).toContain('col-e');
  });

  it('preserves multi-filter interaction between budget, city, and branch', async () => {
    // Budget: 75k, City: Vijayawada, Branch: ECE -> Only col-a has ECE (col-b only has CSE)
    const { req, res, getResult } = mockReqRes({
      query: 'electronics colleges',
      budget: 'under ₹75k',
      city: 'Vijayawada',
      branch: 'ECE'
    });
    await searchHandler(req, res);
    const result = getResult();
    expect(result.status).toBe(200);
    expect(result.json.results.length).toBe(1);
    expect(result.json.results[0].id).toBe('col-a');
  });
});
