'use client'

// Admin variant of NeedsPhotosClient. Differences from the vendor version:
//   - Vendor filter pills at the top (route-driven via search params)
//   - Problem-type filter (placeholder / stock-photo / missing)
//   - Each tile shows the vendor name (since this is cross-vendor)
//   - Grouped by vendor, not category, since admin chunks vendor-by-vendor
//
// Reuses DragDropImageZone — the replace-image API already accepts ADMIN
// role for any product, so the same component works without changes.
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, ExternalLink, X } from 'lucide-react'
import { DragDropImageZone } from '@/components/vendor/DragDropImageZone'

interface ProductTile {
  id: string
  name: string
  slug: string
  image: string
  problem: 'none' | 'missing' | 'placeholder' | 'stock-photo'
  status: string
  stock: number
  category: string
  vendorId: string
  vendorName: string
}

interface VendorPill {
  id: string
  name: string
  count: number
}

const PROBLEM_LABEL: Record<ProductTile['problem'], string> = {
  none: 'OK',
  missing: 'No image',
  placeholder: 'Placeholder',
  'stock-photo': 'Stock photo',
}

const PROBLEM_COLOR: Record<ProductTile['problem'], string> = {
  none: 'bg-green-50 text-green-700',
  missing: 'bg-red-50 text-red-700',
  placeholder: 'bg-amber-50 text-amber-800',
  'stock-photo': 'bg-blue-50 text-blue-700',
}

export function AdminNeedsPhotosClient({
  products,
  vendorPills,
  activeVendorId,
  activeProblem,
}: {
  products: ProductTile[]
  vendorPills: VendorPill[]
  activeVendorId: string | null
  activeProblem: string | null
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [fixed, setFixed] = useState<Record<string, string>>({})

  // Build a URL with one search param toggled (or removed if it's the same)
  const filterHref = (key: 'vendor' | 'problem', value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (!value) next.delete(key)
    else next.set(key, value)
    const qs = next.toString()
    return qs ? `?${qs}` : '/admin/products/needs-photos'
  }

  const fixedCount = Object.keys(fixed).length
  const total = products.length

  // Group by vendor for visual chunking
  const grouped = useMemo(() => {
    const m = new Map<string, { vendorName: string; items: ProductTile[] }>()
    for (const p of products) {
      const k = p.vendorId
      if (!m.has(k)) m.set(k, { vendorName: p.vendorName, items: [] })
      m.get(k)!.items.push(p)
    }
    return Array.from(m.entries()).sort((a, b) => b[1].items.length - a[1].items.length)
  }, [products])

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">
            Vendor
          </span>
          <button
            onClick={() => router.push(filterHref('vendor', null))}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              !activeVendorId
                ? 'bg-[#C9A84C] text-black font-semibold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({vendorPills.reduce((s, v) => s + v.count, 0)})
          </button>
          {vendorPills.map((v) => (
            <button
              key={v.id}
              onClick={() => router.push(filterHref('vendor', v.id))}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                activeVendorId === v.id
                  ? 'bg-[#C9A84C] text-black font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {v.name} <span className="opacity-60">({v.count})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">
            Problem
          </span>
          {(['placeholder', 'stock-photo', 'missing'] as const).map((p) => (
            <button
              key={p}
              onClick={() => router.push(filterHref('problem', activeProblem === p ? null : p))}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                activeProblem === p
                  ? 'bg-[#D62828] text-white font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {PROBLEM_LABEL[p]}
              {activeProblem === p && <X className="inline h-3 w-3 ml-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky session progress */}
      <div className="sticky top-0 z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-gray-50/95 backdrop-blur border-b border-gray-200 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-gray-900">
            {fixedCount} of {total} fixed
          </span>
          <span className="text-xs text-gray-500 ml-2">in this session</span>
        </div>
        <div className="w-48 h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-[#D62828] transition-all duration-500"
            style={{ width: `${total > 0 ? (fixedCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-700 font-semibold">No bad images match the current filter.</p>
        </div>
      ) : (
        grouped.map(([vendorId, group]) => (
          <section key={vendorId}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                {group.vendorName}
                <span className="text-gray-400 ml-2 normal-case font-normal">
                  · {group.items.length} bad
                </span>
              </h2>
              <Link
                href={`/admin/vendors/${vendorId}`}
                className="text-xs text-gray-500 hover:text-[#D62828]"
              >
                View vendor →
              </Link>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.items.map((p) => {
                const isFixed = !!fixed[p.id]
                const displayImage = fixed[p.id] || p.image
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col shadow-sm"
                  >
                    {isFixed ? (
                      <div className="relative aspect-square">
                        <img
                          src={displayImage}
                          alt={p.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-green-500/20 flex flex-col items-center justify-center">
                          <CheckCircle2 className="h-10 w-10 text-green-600 drop-shadow" />
                          <span className="text-xs font-semibold text-green-700 mt-1 drop-shadow">
                            Updated
                          </span>
                        </div>
                      </div>
                    ) : (
                      <DragDropImageZone
                        productId={p.id}
                        currentImage={p.image || null}
                        position="replace"
                        onComplete={(url) => setFixed((s) => ({ ...s, [p.id]: url }))}
                      />
                    )}

                    <div className="p-3 flex-1 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                          {p.name}
                        </p>
                        {!isFixed && (
                          <span
                            className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PROBLEM_COLOR[p.problem]}`}
                          >
                            {PROBLEM_LABEL[p.problem]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {p.category} · {p.stock} stock
                        </span>
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-0.5 text-gray-500 hover:text-[#D62828]"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
