import prisma from './prisma'

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

export const PROMO_SLOTS = ['TICKER', 'BANNER', 'HERO'] as const

// Text columns an admin request may write. Kept here (not in the route file)
// because Next.js route modules may only export HTTP handlers + config.
const PROMO_TEXT_FIELDS = [
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
