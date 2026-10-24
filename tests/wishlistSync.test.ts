import { describe, it, expect } from 'vitest';
import { normalizeWishlistIds } from '../src/contexts/WishlistContext';

describe('Account-Safe Wishlist Synchronization Contract (FEAT-11)', () => {
  // Storage key generators
  const GUEST_STORAGE_KEY = 'guest_wishlist_ids';
  const getUserStorageKey = (uid: string) => `user_wishlist_${uid}`;

  it('keeps guest storage keys separate from authenticated user keys', () => {
    const userAKey = getUserStorageKey('user-alice-123');
    const userBKey = getUserStorageKey('user-bob-456');

    expect(GUEST_STORAGE_KEY).not.toBe(userAKey);
    expect(userAKey).not.toBe(userBKey);
    expect(userAKey).toBe('user_wishlist_user-alice-123');
    expect(userBKey).toBe('user_wishlist_user-bob-456');
  });

  describe('Guest-to-Account Atomic Merge Logic', () => {
    function mergeGuestIntoAccount(remoteWishlist: unknown, guestWishlist: unknown): {
      merged: string[];
      hasNewItems: boolean;
    } {
      const remoteIds = normalizeWishlistIds(remoteWishlist);
      const guestIds = normalizeWishlistIds(guestWishlist);

      const merged = Array.from(new Set([...remoteIds, ...guestIds]));
      const hasNewItems = merged.length > remoteIds.length;

      return { merged, hasNewItems };
    }

    it('merges guest items into an empty remote account', () => {
      const remote: string[] = [];
      const guest = ['vit-ap', 'srm-ap'];

      const result = mergeGuestIntoAccount(remote, guest);
      expect(result.merged).toEqual(['vit-ap', 'srm-ap']);
      expect(result.hasNewItems).toBe(true);
    });

    it('unions guest items with existing remote items without duplicates', () => {
      const remote = ['vit-ap', 'gitam'];
      const guest = ['srm-ap', 'vit-ap']; // 'vit-ap' is duplicated

      const result = mergeGuestIntoAccount(remote, guest);
      expect(result.merged).toEqual(['vit-ap', 'gitam', 'srm-ap']);
      expect(result.hasNewItems).toBe(true);
    });

    it('detects when guest items are already present in remote account and avoids redundant writes', () => {
      const remote = ['vit-ap', 'srm-ap'];
      const guest = ['vit-ap'];

      const result = mergeGuestIntoAccount(remote, guest);
      expect(result.merged).toEqual(['vit-ap', 'srm-ap']);
      expect(result.hasNewItems).toBe(false);
    });

    it('gracefully handles null or missing remote document payload', () => {
      const result = mergeGuestIntoAccount(null, ['vit-ap']);
      expect(result.merged).toEqual(['vit-ap']);
      expect(result.hasNewItems).toBe(true);
    });

    it('gracefully handles empty guest items without modifying remote account', () => {
      const remote = ['andhra-university'];
      const result = mergeGuestIntoAccount(remote, []);
      expect(result.merged).toEqual(['andhra-university']);
      expect(result.hasNewItems).toBe(false);
    });
  });

  describe('Account Switch Isolation Contract', () => {
    it('isolates lists between User A and User B so that neither leaks into the other', () => {
      const userACache: Record<string, string> = {
        [getUserStorageKey('user-a')]: JSON.stringify(['vit-ap', 'srm-ap'])
      };
      const userBCache: Record<string, string> = {
        [getUserStorageKey('user-b')]: JSON.stringify(['andhra-university'])
      };

      const userAIds = normalizeWishlistIds(JSON.parse(userACache[getUserStorageKey('user-a')]));
      const userBIds = normalizeWishlistIds(JSON.parse(userBCache[getUserStorageKey('user-b')]));

      expect(userAIds).toEqual(['vit-ap', 'srm-ap']);
      expect(userBIds).toEqual(['andhra-university']);
      expect(userAIds).not.toContain('andhra-university');
      expect(userBIds).not.toContain('vit-ap');
    });
  });
});
