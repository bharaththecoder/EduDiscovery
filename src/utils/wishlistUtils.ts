// src/utils/wishlistUtils.ts
// Pure utility functions for wishlist ID normalization and storage keys
// Separated from React component contexts to support 100% Vite Fast Refresh stability.

export const GUEST_STORAGE_KEY = 'guest_wishlist_ids';
export const getUserStorageKey = (uid: string) => `user_wishlist_${uid}`;

/**
 * Normalizes raw wishlist data (extracts IDs whether raw items are string IDs or legacy University objects)
 */
export function normalizeWishlistIds(rawList: unknown): string[] {
  if (!Array.isArray(rawList)) return [];
  const ids: string[] = [];
  for (const item of rawList) {
    if (typeof item === 'string' && item.trim()) {
      ids.push(item.trim());
    } else if (item && typeof item === 'object' && 'id' in item && typeof (item as any).id === 'string') {
      ids.push((item as any).id.trim());
    }
  }
  return Array.from(new Set(ids));
}
