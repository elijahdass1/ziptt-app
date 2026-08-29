export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { safeQuery } from '@/lib/safeQuery'
import { PromoManager, type Promo } from '@/components/admin/PromoManager'

export default async function AdminPromosPage() {
  // safeQuery so the page still renders (empty) if the Promo table isn't there
  // yet (pre-`prisma db push`) instead of 500ing the admin panel.
  const promos = (await safeQuery(
    () =>
      prisma.promo.findMany({
        orderBy: [{ slot: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
    [],
    'admin:promos'
  )) as Promo[]

  return (
    <div className="bg-[var(--bg-primary)] min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia,serif' }}>
          Homepage Ads
        </h1>
        <p className="text-sm text-[#888] mt-1">
          Control the promotional content on the homepage — the hero, the mid-page banner, and the scrolling ticker.
          Each slot falls back to the built-in default when nothing here is active.
        </p>
      </div>
      <PromoManager initialPromos={promos} />
    </div>
  )
}
