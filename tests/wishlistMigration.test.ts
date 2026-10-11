import { describe, it, expect } from 'vitest';
import { normalizeWishlistIds } from '../src/contexts/WishlistContext';

describe('Wishlist Data Architecture & Normalization (PERF-02)', () => {
  it('handles empty or non-array inputs gracefully', () => {
    expect(normalizeWishlistIds(null)).toEqual([]);
    expect(normalizeWishlistIds(undefined)).toEqual([]);
    expect(normalizeWishlistIds({})).toEqual([]);
    expect(normalizeWishlistIds('vit-ap')).toEqual([]);
    expect(normalizeWishlistIds([])).toEqual([]);
  });

  it('normalizes string ID arrays and trims whitespace', () => {
    const raw = ['vit-ap', '  srm-ap  ', 'kl-university'];
    expect(normalizeWishlistIds(raw)).toEqual(['vit-ap', 'srm-ap', 'kl-university']);
  });

  it('deduplicates identical IDs in the list', () => {
    const raw = ['vit-ap', 'srm-ap', 'vit-ap', 'srm-ap'];
    expect(normalizeWishlistIds(raw)).toEqual(['vit-ap', 'srm-ap']);
  });

  it('migrates legacy University full objects by extracting the id field', () => {
    const legacyList = [
      { id: 'vit-ap', name: 'VIT-AP University', tuitionFee: 200000 },
      { id: 'srm-ap', name: 'SRM University AP', tuitionFee: 250000 }
    ];
    expect(normalizeWishlistIds(legacyList)).toEqual(['vit-ap', 'srm-ap']);
  });

  it('migrates mixed arrays containing both string IDs and legacy objects seamlessly', () => {
    const mixedList = [
      'andhra-university',
      { id: 'vit-ap', name: 'VIT-AP University' },
      '  srm-ap ',
      { id: 'andhra-university' } // duplicate check across types
    ];
    expect(normalizeWishlistIds(mixedList)).toEqual(['andhra-university', 'vit-ap', 'srm-ap']);
  });

  it('ignores malformed items without throwing exceptions', () => {
    const corrupted = [
      'vit-ap',
      null,
      12345,
      { title: 'no id here' },
      { id: 456 }, // non-string id
      'srm-ap'
    ];
    expect(normalizeWishlistIds(corrupted)).toEqual(['vit-ap', 'srm-ap']);
  });
});
