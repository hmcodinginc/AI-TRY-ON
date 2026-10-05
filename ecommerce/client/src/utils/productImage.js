import { API_URL } from './config';

export function productImageFallback(name, size = 500) {
  return `https://placehold.co/${size}x${size}/f3f4f6/374151?text=${encodeURIComponent(name || 'Product')}`;
}

/** Normalize product.image from API (relative paths, Unsplash, etc.) */
export function getProductImageSrc(image, name, width = 500) {
  if (!image) return productImageFallback(name, width);

  let url = image.trim();

  if (url.startsWith('/')) {
    url = `${API_URL}${url}`;
  }

  if (url.includes('images.unsplash.com') && !url.includes('?')) {
    url = `${url}?auto=format&fit=crop&w=${width}&q=80`;
  }

  return url;
}
