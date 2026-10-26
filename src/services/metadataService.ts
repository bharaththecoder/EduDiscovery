/**
 * Dynamic OpenGraph and Social Sharing Metadata Service
 * Updates client-side document head tags for individual college profiles and discovery pages.
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

function updateOrCreateMetaTag(selector: string, attribute: string, value: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function updatePageMetadata(meta: PageMetadata) {
  // 1. Document Title
  document.title = meta.title;

  // 2. Standard Meta Description & Keywords
  updateOrCreateMetaTag('meta[name="description"]', 'name', 'description', meta.description);
  if (meta.keywords) {
    updateOrCreateMetaTag('meta[name="keywords"]', 'name', 'keywords', meta.keywords);
  }

  // 3. OpenGraph Properties
  updateOrCreateMetaTag('meta[property="og:title"]', 'property', 'og:title', meta.title);
  updateOrCreateMetaTag('meta[property="og:description"]', 'property', 'og:description', meta.description);
  updateOrCreateMetaTag('meta[property="og:type"]', 'property', 'og:type', meta.type || 'website');

  const currentUrl = meta.url || (typeof window !== 'undefined' ? window.location.href : '');
  if (currentUrl) {
    updateOrCreateMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
  }

  if (meta.image) {
    updateOrCreateMetaTag('meta[property="og:image"]', 'property', 'og:image', meta.image);
    updateOrCreateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', meta.image);
  }

  // 4. Twitter Cards
  updateOrCreateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  updateOrCreateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
  updateOrCreateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);

  // 5. Canonical Link
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', currentUrl);
}
