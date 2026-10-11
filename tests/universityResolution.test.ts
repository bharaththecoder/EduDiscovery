import { describe, it, expect } from 'vitest';
import { getUniversityById as getStaticUniversityById, universities as staticUniversities } from '../src/data/universities';

// Replicates the normalization logic in UniversityDetailPage
function normalizeId(id: string | undefined): string {
  if (!id) return '';
  try {
    return decodeURIComponent(id).trim();
  } catch (e) {
    return id.trim();
  }
}

// Replicates the synchronous resolution logic in UniversityDetailPage
function resolveSynchronously(
  rawId: string | undefined,
  contextUniversities: typeof staticUniversities
) {
  const normalizedId = normalizeId(rawId);
  if (!normalizedId) return undefined;

  // Exact match or case-insensitive match from context
  const fromContext = contextUniversities.find(u => 
    u.id === normalizedId || 
    u.id.toLowerCase() === normalizedId.toLowerCase()
  );
  if (fromContext) return fromContext;

  // Static lookup
  const fromStatic = getStaticUniversityById(normalizedId);
  if (fromStatic) return fromStatic;

  // Hyphenation fallback without stripping legitimate hyphens
  const hyphenated = normalizedId.replace(/\s+/g, '-');
  return (
    contextUniversities.find(u => u.id === hyphenated) ||
    getStaticUniversityById(hyphenated)
  );
}

describe('University ID Resolution and Normalization (BUG-04)', () => {
  it('correctly resolves university with standard hyphenated lowercase ID', () => {
    const uni = resolveSynchronously('vit-ap', staticUniversities);
    expect(uni).toBeDefined();
    expect(uni?.id).toBe('vit-ap');
    expect(uni?.city).toBe('Amaravati');
  });

  it('correctly resolves university case-insensitively', () => {
    const uni = resolveSynchronously('VIT-AP', staticUniversities);
    expect(uni).toBeDefined();
    expect(uni?.id).toBe('vit-ap');
  });

  it('preserves hyphens and digits without corrupted regex stripping', () => {
    // Tests IDs like 'andhra-university' or hypothetical IDs with numbers
    const testList = [
      ...staticUniversities,
      {
        id: 'nit-ap-3',
        name: 'NIT AP Campus 3',
        shortName: 'NIT AP 3',
        city: 'Tadepalligudem',
        state: 'Andhra Pradesh',
        naac: 'A',
        match: 80
      } as any
    ];

    const uni = resolveSynchronously('nit-ap-3', testList);
    expect(uni).toBeDefined();
    expect(uni?.id).toBe('nit-ap-3');
  });

  it('decodes URI-encoded characters safely (%20 spaces to hyphen fallback)', () => {
    const uni = resolveSynchronously('vit%20ap', staticUniversities);
    expect(uni).toBeDefined();
    expect(uni?.id).toBe('vit-ap');
  });

  it('returns undefined for non-existent colleges (missing colleges)', () => {
    const uni = resolveSynchronously('non-existent-college-999', staticUniversities);
    expect(uni).toBeUndefined();
  });

  it('returns undefined for empty or missing IDs', () => {
    expect(resolveSynchronously('', staticUniversities)).toBeUndefined();
    expect(resolveSynchronously(undefined, staticUniversities)).toBeUndefined();
  });
});
