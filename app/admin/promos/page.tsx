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
        where: { slot: { in: ['HERO_SPOTLIGHT', 'FEATURED'] } },
        orderBy: [{ slot: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          product: { select: { id: true, name: true, slug: true, images: true, price: true } },
        },
      }),
    [],
    'admin:promos'
  )) as unknown as Promo[]

  return (
    <div className="bg-[var(--bg-primary)] min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia,serif' }}>
          Homepage Ads
        </h1>
        <p className="text-sm text-[#888] mt-1">
          Pick the products shown in the homepage ad spaces. Search and add products to each section; leave a section
          empty to fall back to the automatic selection.
        </p>
      </div>
      <PromoManager initialPromos={promos} />
    </div>
  )
}
