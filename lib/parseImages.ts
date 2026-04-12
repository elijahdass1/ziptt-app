export function parseImages(images: string | string[] | null | undefined): string[] {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const parsed = JSON.parse(images as string)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return typeof images === 'string' && images.startsWith('http') ? [images] : []
  }
}

export function firstImage(
  images: string | string[] | null | undefined,
  fallback = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'
): string {
  const arr = parseImages(images)
  return arr.length > 0 ? arr[0] : fallback
}
