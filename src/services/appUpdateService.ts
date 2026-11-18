import { Capacitor } from '@capacitor/core';

export const CURRENT_APP_VERSION = '1.0.0';
const GITHUB_REPO = 'bharaththecoder/EduDiscovery';
const CACHE_KEY = 'edudiscovery_release_info';
const DISMISSED_KEY = 'edudiscovery_update_dismissed_tag';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface ReleaseInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseTitle: string;
  releaseNotes: string;
  apkDownloadUrl: string;
  apkSizeMb?: number;
  publishedAt: string;
  htmlUrl: string;
}

/**
 * Clean version string: 'v1.0.1' -> '1.0.1'
 */
export function cleanVersion(v: string): string {
  return v.replace(/^[vV]/, '').trim();
}

/**
 * Compare semantic versions.
 * Returns true if candidate is strictly newer than current.
 * e.g., isNewerVersion('1.0.0', '1.0.1') -> true
 *       isNewerVersion('1.0.1', '1.0.1') -> false
 *       isNewerVersion('1.1.0', '1.0.9') -> false
 */
export function isNewerVersion(current: string, candidate: string): boolean {
  const cParts = cleanVersion(current).split('.').map(Number);
  const candParts = cleanVersion(candidate).split('.').map(Number);

  const maxLen = Math.max(cParts.length, candParts.length);
  for (let i = 0; i < maxLen; i++) {
    const c = cParts[i] || 0;
    const cand = candParts[i] || 0;
    if (cand > c) return true;
    if (cand < c) return false;
  }
  return false;
}

/**
 * Check if the application is running inside the native Android Capacitor shell
 */
export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

/**
 * Check GitHub Releases for the latest version.
 * Employs 12h localStorage cache to prevent rate-limiting.
 */
export async function checkForAppUpdate(force = false): Promise<ReleaseInfo | null> {
  // Check local cache unless forced
  if (!force) {
    try {
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const { timestamp, data } = JSON.parse(cachedRaw);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          return {
            ...data,
            hasUpdate: isNewerVersion(CURRENT_APP_VERSION, data.latestVersion),
          };
        }
      }
    } catch {
      // Ignore cache read errors
    }
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const release = await response.json();
    const latestTag = release.tag_name || '';
    const latestVersion = cleanVersion(latestTag);
    const hasUpdate = isNewerVersion(CURRENT_APP_VERSION, latestVersion);

    // Find the .apk asset in release assets
    const apkAsset = Array.isArray(release.assets)
      ? release.assets.find((a: any) => a.name?.toLowerCase().endsWith('.apk'))
      : null;

    const apkDownloadUrl = apkAsset?.browser_download_url || release.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`;
    const apkSizeMb = apkAsset?.size ? Math.round((apkAsset.size / (1024 * 1024)) * 10) / 10 : undefined;

    const releaseInfo: ReleaseInfo = {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion,
      releaseTitle: release.name || latestTag,
      releaseNotes: release.body || '',
      apkDownloadUrl,
      apkSizeMb,
      publishedAt: release.published_at || new Date().toISOString(),
      htmlUrl: release.html_url || `https://github.com/${GITHUB_REPO}/releases`,
    };

    // Store in cache
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: releaseInfo })
      );
    } catch {
      // Ignore cache write errors
    }

    return releaseInfo;
  } catch (error) {
    console.warn('[AppUpdateService] Failed to check for latest release:', error);
    return null;
  }
}

/**
 * Check if the user has snoozed/dismissed the current release tag
 */
export function isUpdateDismissed(tag: string): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === tag;
  } catch {
    return false;
  }
}

/**
 * Snooze update banner for this specific tag
 */
export function dismissUpdate(tag: string): void {
  try {
    localStorage.setItem(DISMISSED_KEY, tag);
  } catch {
    // Ignore
  }
}
