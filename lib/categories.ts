// Storefront category inclusion. Products have a single categoryId, but some
// categories are conceptually supersets of others. "Urban Fashion & Streetwear"
// (urban-fashion) is a subset of "Fashion & Clothing" (fashion), so browsing
// Fashion should also surface Streetwear products — e.g. Don Wvrldwide's
// streetwear then appears in BOTH Fashion and Streetwear, with no duplication
// and no schema change.
//
// Only add supersets here (a broad category that includes narrower ones). The
// narrower category still shows only its own products.
export const CATEGORY_INCLUDES: Record<string, string[]> = {
  fashion: ['fashion', 'urban-fashion'],
}

// The set of category slugs a browsed category should match. Falls back to just
// the slug itself when there's no inclusion rule.
export function categorySlugsFor(slug: string): string[] {
  return CATEGORY_INCLUDES[slug] ?? [slug]
}
