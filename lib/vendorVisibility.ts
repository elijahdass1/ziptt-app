// Single source of truth for which vendors are publicly visible / purchasable.
//
// A vendor's storefront and products only appear on the public site when its
// status is one of these. Anything else (PENDING, REJECTED, SUSPENDED, and the
// future REMOVED) is hidden — its products must not show in listings, on the
// homepage, on product detail pages, or in the vendor directory. The checkout
// API (app/api/orders/route.ts) enforces the same set server-side so a hidden
// vendor's product can't be ordered even via a direct call.
//
// Historically two "live" states exist in the data — APPROVED (from the admin
// approval flow) and ACTIVE — so both must be treated as visible. Filtering on
// APPROVED alone wrongly hides ACTIVE vendors; filtering on ACTIVE alone would
// hide everyone.
export const LIVE_VENDOR_STATUSES = ['APPROVED', 'ACTIVE']

// Whether a given vendor status is publicly visible/purchasable.
export function isLiveVendorStatus(status: string | null | undefined): boolean {
  return !!status && LIVE_VENDOR_STATUSES.includes(status)
}

// Prisma `where` fragment for a Product query: restrict to products whose vendor
// is live. Spread into a product `where` alongside `status: 'ACTIVE'`:
//   where: { status: 'ACTIVE', ...liveVendorProductWhere }
// (Not `as const` — Prisma's generated input types reject deeply-readonly objects.)
export const liveVendorProductWhere = {
  vendor: { status: { in: LIVE_VENDOR_STATUSES } },
}

// Prisma `where` fragment for a Vendor query: the vendor itself must be live.
export const liveVendorWhere = {
  status: { in: LIVE_VENDOR_STATUSES },
}
