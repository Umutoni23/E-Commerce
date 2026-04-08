import type { Product } from '../types';
import heroImage from '../assets/hero.png';

const DEFAULT_IMAGE = heroImage;

function normalizeImageEntry(image: unknown): string | null {
  if (typeof image === 'string' && image.trim()) return image.trim();
  if (image && typeof image === 'object') {
    const candidate = (image as { url?: unknown; imageUrl?: unknown; src?: unknown }).url
      ?? (image as { url?: unknown; imageUrl?: unknown; src?: unknown }).imageUrl
      ?? (image as { url?: unknown; imageUrl?: unknown; src?: unknown }).src;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
}

export function getProductImage(product: Partial<Product> & {
  images?: unknown;
  image?: unknown;
  imageUrl?: unknown;
  thumbnail?: unknown;
}) {
  const fromImages = Array.isArray(product.images)
    ? product.images.map(normalizeImageEntry).find(Boolean)
    : null;

  const directImage =
    normalizeImageEntry(product.image)
    ?? normalizeImageEntry(product.imageUrl)
    ?? normalizeImageEntry(product.thumbnail);

  if (fromImages) return fromImages;
  if (directImage) return directImage;

  return DEFAULT_IMAGE;
}

export function getFallbackProductImage() {
  return DEFAULT_IMAGE;
}
