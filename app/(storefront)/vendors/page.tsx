// "Search by Seller" — directory of all approved vendors.
//
// Filters: free-text query (matches storeName), region.
// Sort: most products | highest rated | newest joined.
// Each card shows cover photo (or banner fallback), logo, name, rating,
// product count, region — clickable into the Facebook-style profile.
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Search, Store, Star, MapPin, Package, BadgeCheck } from 'lucide-react'
import prisma from '@/lib/prisma'

interface PageProps {
  searchParams: { q?: string; region?: string; sort?: string }
}

export default async function VendorsDirectoryPage({ searchParams }: PageProps) {
  const q      = (searchParams.q ?? '').trim()
  const region = searchParams.region ?? ''
  const sort   = searchParams.sort ?? 'products'

  const orderBy: any =
    sort === 'rating'  ? [{ rating: 'desc' }, { reviewCount: 'desc' }]
    : sort === 'newest' ? { createdAt: 'desc' }
    : { totalSales: 'desc' } // 'products' default — sort by sales as a proxy

  const where: any = {
    status: 'APPROVED',
    ...(q && { storeName: { contains: q, mode: 'insensitive' } }),
    ...(region && { region }),
  }

  const [vendors, regions] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy,
      take: 60,
      include: {
        _count: { select: { products: { where: { status: 'ACTIVE' } } } },
      },
    }),
    // Distinct regions across active vendors — used for the region pills.
    prisma.vendor.findMany({
      where: { status: 'APPROVED', region: { not: null } },
      select: { region: true },
      distinct: ['region'],
    }),
  ])

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    if (q)      p.set('q', q)
    if (region) p.set('region', region)
    if (sort !== 'products') p.set('sort', sort)
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    const qs = p.toString()
    return qs ? `/vendors?${qs}` : '/vendors'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-[#C9A84C]" />
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">All Sellers</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {vendors.length} active seller{vendors.length !== 1 ? 's' : ''}
          {q && <> · matching &quot;{q}&quot;</>}
        </p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3 mb-6">
        <form action="/vendors" method="get">
          {/* Preserve other filters when searching */}
          {region && <input type="hidden" name="region" value={region} />}
          {sort !== 'products' && <input type="hidden" name="sort" value={sort} />}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search sellers by name…"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[#C9A84C]/30 rounded-full text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Region pills */}
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mr-1">Region</span>
          <Link
            href={buildUrl({ region: undefined })}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              !region
                ? 'bg-[#C9A84C] text-black border-[#C9A84C] font-semibold'
                : 'text-[var(--text-secondary)] border-[#C9A84C]/20 hover:border-[#C9A84C]/50 hover:text-[var(--text-primary)]'
            }`}
          >All</Link>
          {regions
            .map((r) => r.region!)
            .filter(Boolean)
            .sort()
            .map((r) => (
              <Link
                key={r}
                href={buildUrl({ region: r })}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  region === r
                    ? 'bg-[#C9A84C] text-black border-[#C9A84C] font-semibold'
                    : 'text-[var(--text-secondary)] border-[#C9A84C]/20 hover:border-[#C9A84C]/50 hover:text-[var(--text-primary)]'
                }`}
              >{r}</Link>
            ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mr-1">Sort</span>
          {[
            { value: 'products', label: 'Most Active' },
            { value: 'rating',   label: 'Top Rated' },
            { value: 'newest',   label: 'Newest' },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl({ sort: opt.value })}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                sort === opt.value
                  ? 'bg-[#1A1A00] text-[#C9A84C] border-[#C9A84C]/40 font-semibold'
                  : 'text-[var(--text-secondary)] border-[#C9A84C]/15 hover:border-[#C9A84C]/40 hover:text-[var(--text-primary)]'
              }`}
            >{opt.label}</Link>
          ))}
        </div>
      </div>

      {/* Vendor grid */}
      {vendors.length === 0 ? (
        <div className="text-center py-24">
          <Store className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" strokeWidth={1.2} />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No sellers found</h3>
          <p className="text-sm text-[var(--text-secondary)]">Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vendors.map((v) => (
            <Link
              key={v.id}
              href={`/store/${v.slug}`}
              className="group bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl overflow-hidden hover:border-[#C9A84C]/40 transition-colors"
            >
              {/* Cover */}
              <div className="relative aspect-[16/6] bg-gradient-to-br from-[#1A1500] to-[var(--bg-primary)] overflow-hidden">
                {(v.coverImage || v.banner) && (
                  <img
                    src={v.coverImage ?? v.banner!}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>

              {/* Identity */}
              <div className="p-4 -mt-8 relative">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] ring-1 ring-[#C9A84C]/30 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                    {v.logo ? (
                      <img src={v.logo} alt={v.storeName} className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-6 w-6 text-[#C9A84C]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold text-[var(--text-primary)] truncate group-hover:text-[#C9A84C] transition-colors">
                        {v.storeName}
                      </h2>
                      {v.idVerified && <BadgeCheck className="h-4 w-4 text-[#C9A84C] shrink-0" />}
                    </div>
                    {v.region && (
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {v.region}
                      </p>
                    )}
                  </div>
                </div>

                {(v.description || v.bio) && (
                  <p className="text-xs text-[var(--text-secondary)] mt-3 line-clamp-2 leading-relaxed">
                    {v.description || v.bio}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#C9A84C]/10 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" /> {v._count.products}
                  </span>
                  {v.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />
                      <span className="font-bold text-[var(--text-primary)]">{v.rating.toFixed(1)}</span>
                      <span>({v.reviewCount})</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
