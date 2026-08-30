import { revalidatePath } from 'next/cache'

// Storefront pages use ISR (`export const revalidate = …`), so a cached static
// render is served for up to that window. Admin/vendor edits therefore don't
// appear until the window elapses — unless we explicitly invalidate on write.
//
// IMPORTANT: `next dev` disables ISR, so this class of bug is invisible in dev.
// Any change to admin-facing content that a public page shows MUST invalidate
// here, and be verified with `npm run build && npm run start` (not `dev`).

// Homepage-only invalidation — for changes that only affect `/` (e.g. the
// homepage ad picker: hero spotlight, trending, featured rails).
export function revalidateHome() {
  revalidatePath('/')
}

// Full public-storefront invalidation — for changes to products or vendors that
// can surface across many public pages. Pass the specific slugs when known so
// only those detail pages regenerate; otherwise the whole dynamic route is
// revalidated.
export function revalidateStorefront(opts: { productSlug?: string; vendorSlug?: string } = {}) {
  revalidatePath('/')          // homepage rails/hero/trending/featured/vendors
  revalidatePath('/products')  // product listing + filters
  revalidatePath('/vendors')   // vendor directory
  if (opts.productSlug) revalidatePath(`/products/${opts.productSlug}`)
  else revalidatePath('/products/[slug]', 'page')
  if (opts.vendorSlug) revalidatePath(`/store/${opts.vendorSlug}`)
  else revalidatePath('/store/[slug]', 'page')
}
