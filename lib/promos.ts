import prisma from './prisma'
import { LIVE_VENDOR_STATUSES } from './vendorVisibility'

// The product-based homepage ad slots the admin controls.
export const AD_PRODUCT_SLOTS = ['TRENDING', 'HERO_SPOTLIGHT', 'FEATURED'] as const

// Row shape the homepage/admin consume. Mirrors the Prisma `Promo` model but
// declared explicitly so components don't need the generated type.
export type PromoRow = {
  id: string
  slot: string
  active: boolean
  sortOrder: number
  eyebrow: string | null
  title: string | null
  titleAccent: string | null
  subtitle: string | null
  icon: string | null
  accent: string | null
  ctaLabel: string | null
  ctaHref: string | null
  cta2Label: string | null
  cta2Href: string | null
}

export type ActivePromos = {
  ticker: PromoRow[]
  banner: PromoRow | null
  hero: PromoRow | null
}

export const EMPTY_PROMOS: ActivePromos = { ticker: [], banner: null, hero: null }

// Valid slots the admin API accepts. HERO_SPOTLIGHT/FEATURED are the current
// product-based ad slots; the TICKER/BANNER/HERO text slots are legacy but kept
// accepted so any existing rows still validate.
export const PROMO_SLOTS = ['TRENDING', 'HERO_SPOTLIGHT', 'FEATURED', 'HERO_BG', 'TICKER', 'BANNER', 'HERO'] as const

// Text columns an admin request may write. Kept here (not in the route file)
// because Next.js route modules may only export HTTP handlers + config.
const PROMO_TEXT_FIELDS = [
  'productId', 'imageUrl',
  'eyebrow', 'title', 'titleAccent', 'subtitle', 'icon', 'accent',
  'ctaLabel', 'ctaHref', 'cta2Label', 'cta2Href',
] as const

// Build a Prisma data payload from a request body: only whitelisted fields,
// empty strings coerced to null, sortOrder/active clamped.
export function sanitizePromo(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  for (const f of PROMO_TEXT_FIELDS) {
    if (f in body) {
      const v = body[f]
      data[f] = typeof v === 'string' && v.trim() ? v.trim() : null
    }
  }
  if ('active' in body) data.active = Boolean(body.active)
  if ('sortOrder' in body) {
    const n = Number(body.sortOrder)
    data.sortOrder = Number.isFinite(n) ? Math.trunc(n) : 0
  }
  return data
}

// Fetch the active promos grouped by homepage slot. Call inside safeQuery on the
// homepage so a missing table (pre-`db push`) or DB blip falls back to
// EMPTY_PROMOS and the page renders its hardcoded defaults.
// The relations a homepage product card / hero spotlight needs.
const AD_PRODUCT_INCLUDE = {
  category: { select: { name: true, slug: true } },
  vendor: { select: { storeName: true, slug: true } },
} as const

// Load the admin-selected products for the two product ad slots, in the admin's
// chosen order. Filtered to purchasable products (ACTIVE + live vendor) so a
// product that's picked and later hidden/suspended silently drops out of the ad.
export async function getAdProducts() {
  const rows = await prisma.promo.findMany({
    where: {
      active: true,
      slot: { in: [...AD_PRODUCT_SLOTS] },
      productId: { not: null },
      product: { status: 'ACTIVE', vendor: { status: { in: LIVE_VENDOR_STATUSES } } },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { product: { include: AD_PRODUCT_INCLUDE } },
  })
  const pick = (slot: string) => rows.filter((r) => r.slot === slot).map((r) => r.product!).filter(Boolean)
  return { trending: pick('TRENDING'), heroSpotlight: pick('HERO_SPOTLIGHT'), featured: pick('FEATURED') }
}

export const EMPTY_AD_PRODUCTS = { trending: [] as any[], heroSpotlight: [] as any[], featured: [] as any[] }

// The admin-set background/ad image for the hero (slot HERO_BG), or null.
export async function getHeroBackground(): Promise<string | null> {
  const row = await prisma.promo.findFirst({
    where: { slot: 'HERO_BG', active: true, imageUrl: { not: null } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { imageUrl: true },
  })
  return row?.imageUrl ?? null
}

export async function getActivePromos(): Promise<ActivePromos> {
  const rows = (await prisma.promo.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })) as PromoRow[]
  return {
    ticker: rows.filter((r) => r.slot === 'TICKER'),
    banner: rows.find((r) => r.slot === 'BANNER') ?? null,
    hero: rows.find((r) => r.slot === 'HERO') ?? null,
  }
}
