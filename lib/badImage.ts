/**
 * Detect product images that are clearly placeholders or stock photos
 * (not real product shots). Used by the "Fix Product Photos" workflow
 * so vendors can quickly find and replace these.
 *
 * The Product.images field is a JSON-stringified string[] (per Prisma schema),
 * so we accept the raw string or a parsed array.
 */
import { parseImages } from './parseImages'

// Hosts/path fragments that indicate a placeholder rather than a real photo.
// - placehold.co / placeholder.com — generic gray placeholders
// - /api/product-img — internal SVG fallback served when no real image exists
// - images.unsplash — generic stock photos seeded during data import
const BAD_FRAGMENTS = [
  'placehold.co',
  'placeholder.com',
  '/api/product-img',
  'images.unsplash',
]

/** Returns true if the FIRST image (or all images) look like a placeholder. */
export function hasBadImage(
  images: string | string[] | null | undefined
): boolean {
  const arr = parseImages(images)
  if (arr.length === 0) return true // no image at all is clearly bad
  // Treat as bad if every image is a placeholder. If even one is real, it'll
  // be shown as the main image and that's fine.
  return arr.every((u) => BAD_FRAGMENTS.some((f) => u.includes(f)))
}

/** Categorise the badness so the UI can show why a row was flagged. */
export function imageProblem(
  images: string | string[] | null | undefined
): 'none' | 'missing' | 'placeholder' | 'stock-photo' {
  const arr = parseImages(images)
  if (arr.length === 0) return 'missing'
  const first = arr[0]
  if (first.includes('placehold.co') || first.includes('placeholder.com') || first.includes('/api/product-img')) {
    return 'placeholder'
  }
  if (first.includes('images.unsplash')) return 'stock-photo'
  return 'none'
}

/** SQL fragment for filtering Product rows with a bad image. */
export const BAD_IMAGE_SQL_WHERE = `(
  images LIKE '%placehold.co%'
  OR images LIKE '%placeholder.com%'
  OR images LIKE '%/api/product-img%'
  OR images LIKE '%images.unsplash%'
  OR images = '[]'
  OR images IS NULL
)`
