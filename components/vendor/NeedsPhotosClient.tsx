'use client'

// Client list for the "Fix Product Photos" workflow.
// - Shows a grid of product tiles, each with a DragDropImageZone
// - When a tile finishes uploading, we mark it as fixed and (optionally)
//   slide it out of the list, so vendors get a satisfying progress signal
// - Header shows live counter: "X of N fixed"
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { DragDropImageZone } from './DragDropImageZone'

interface ProductTile {
  id: string
  name: string
  slug: string
  image: string
  problem: 'none' | 'missing' | 'placeholder' | 'stock-photo'
  status: string
  stock: number
  category: string
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

export function NeedsPhotosClient({ products }: { products: ProductTile[] }) {
  // Track which tiles have been fixed in this session. We don't remove them
  // immediately — the success state is more useful as feedback than as a fade.
  const [fixed, setFixed] = useState<Record<string, string>>({}) // productId -> new url

  const fixedCount = Object.keys(fixed).length
  const total = products.length

  // Group by category so vendors with hundreds of bad photos can chunk through
  // them one section at a time.
  const grouped = useMemo(() => {
    const m = new Map<string, ProductTile[]>()
    for (const p of products) {
      const k = p.category || 'Uncategorised'
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(p)
    }
    return Array.from(m.entries()).sort((a, b) => b[1].length - a[1].length)
  }, [products])

  return (
    <div className="space-y-6">
      {/* Sticky progress bar */}
      <div className="sticky top-0 z-10 -mx-8 px-8 py-3 bg-[var(--bg-primary)]/95 backdrop-blur border-b border-[#C9A84C]/20 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {fixedCount} of {total} fixed
          </span>
          <span className="text-xs text-[var(--text-secondary)] ml-2">in this session</span>
        </div>
        <div className="w-48 h-1.5 rounded-full bg-[#C9A84C]/15 overflow-hidden">
          <div
            className="h-full bg-[#C9A84C] transition-all duration-500"
            style={{ width: `${total > 0 ? (fixedCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {grouped.map(([cat, items]) => (
        <section key={cat}>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            {cat} <span className="text-[var(--text-secondary)]/50">· {items.length}</span>
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => {
              const isFixed = !!fixed[p.id]
              const displayImage = fixed[p.id] || p.image
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[#C9A84C]/15 bg-[#111] overflow-hidden flex flex-col"
                >
                  {isFixed ? (
                    // Show fixed state: full-bleed new image with check overlay
                    <div className="relative aspect-square">
                      <img
                        src={displayImage}
                        alt={p.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-green-500/20 flex flex-col items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-300 drop-shadow" />
                        <span className="text-xs font-semibold text-green-100 mt-1 drop-shadow">
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
                      <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
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
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>
                        {p.stock} in stock · {p.status}
                      </span>
                      <Link
                        href={`/vendor/products/${p.id}/edit`}
                        className="inline-flex items-center gap-0.5 text-[#C9A84C] hover:underline"
                      >
                        Edit <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
