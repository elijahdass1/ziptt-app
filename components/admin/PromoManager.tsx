'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { firstImage } from '@/lib/parseImages'
import { formatTTD } from '@/lib/utils'
import { Search, Trash2, Loader2, ChevronUp, ChevronDown, Plus } from 'lucide-react'

export type PromoProduct = {
  id: string
  name: string
  slug: string
  images: string
  price: number
}
export type Promo = {
  id: string
  slot: string
  active: boolean
  sortOrder: number
  productId: string | null
  product: PromoProduct | null
}

// The homepage ad spaces the admin fills with products.
const SECTIONS: { slot: string; label: string; desc: string }[] = [
  {
    slot: 'HERO_SPOTLIGHT',
    label: 'Hero Spotlight',
    desc: 'The big rotating product card at the top of the homepage. Empty = automatic (top trending).',
  },
  {
    slot: 'FEATURED',
    label: 'Featured Products',
    desc: 'The "Featured Products" rail. Empty = automatic (products flagged as featured).',
  },
]

export function PromoManager({ initialPromos }: { initialPromos: Promo[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<Promo[]>(initialPromos)
  const [busy, setBusy] = useState(false)

  const forSlot = (slot: string) =>
    rows.filter((r) => r.slot === slot).sort((a, b) => a.sortOrder - b.sortOrder)

  async function addProduct(slot: string, product: PromoProduct) {
    if (rows.some((r) => r.slot === slot && r.productId === product.id)) {
      toast({ title: 'Already added to this section' })
      return
    }
    setBusy(true)
    try {
      const nextOrder = Math.max(0, ...forSlot(slot).map((r) => r.sortOrder + 1))
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, productId: product.id, sortOrder: nextOrder }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      // The POST response doesn't include the product relation — attach it locally.
      setRows((rs) => [...rs, { ...created, product }])
      toast({ title: `Added “${product.name}”` })
      router.refresh()
    } catch {
      toast({ title: 'Failed to add product', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  async function removeRow(id: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setRows((rs) => rs.filter((r) => r.id !== id))
      toast({ title: 'Removed' })
      router.refresh()
    } catch {
      toast({ title: 'Failed to remove', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  // Swap a row with its neighbour in the given direction, persisting both new
  // sortOrders. Keeps the list order the admin sees == the homepage order.
  async function move(slot: string, id: string, dir: -1 | 1) {
    const list = forSlot(slot)
    const i = list.findIndex((r) => r.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    const a = list[i]
    const b = list[j]
    setBusy(true)
    try {
      // Swap their sortOrder values.
      const [aOrder, bOrder] = [b.sortOrder, a.sortOrder]
      setRows((rs) =>
        rs.map((r) => (r.id === a.id ? { ...r, sortOrder: aOrder } : r.id === b.id ? { ...r, sortOrder: bOrder } : r))
      )
      await Promise.all([
        fetch(`/api/admin/promos/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: aOrder }) }),
        fetch(`/api/admin/promos/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: bOrder }) }),
      ])
      router.refresh()
    } catch {
      toast({ title: 'Failed to reorder', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      {SECTIONS.map((section) => {
        const list = forSlot(section.slot)
        return (
          <section key={section.slot} className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{section.label}</h2>
              <p className="text-xs text-[#888] mt-0.5 max-w-xl">{section.desc}</p>
            </div>

            <ProductSearch slot={section.slot} onPick={(p) => addProduct(section.slot, p)} disabled={busy} />

            {list.length === 0 ? (
              <p className="text-sm text-[#555] mt-4">
                No products selected — the homepage uses its automatic selection for this section.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {list.map((row, idx) => (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 bg-[var(--bg-primary)] border border-[var(--bg-card)] rounded-lg p-2.5"
                  >
                    <span className="text-xs text-[#555] w-5 text-center">{idx + 1}</span>
                    <div className="h-11 w-11 rounded-md bg-[var(--bg-card)] overflow-hidden shrink-0">
                      {row.product && (
                        <img src={firstImage(row.product.images)} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate">{row.product?.name ?? '(product removed)'}</p>
                      {row.product && <p className="text-xs text-[#C9A84C]">{formatTTD(row.product.price)}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => move(section.slot, row.id, -1)} disabled={busy || idx === 0}
                        className="p-1.5 rounded border border-[var(--bg-card)] text-[#888] hover:text-[var(--text-primary)] disabled:opacity-30" title="Move up">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => move(section.slot, row.id, 1)} disabled={busy || idx === list.length - 1}
                        className="p-1.5 rounded border border-[var(--bg-card)] text-[#888] hover:text-[var(--text-primary)] disabled:opacity-30" title="Move down">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeRow(row.id)} disabled={busy}
                        className="p-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10" title="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

// Debounced product search that calls the public products API and shows a
// dropdown of matches. Picking one calls onPick and clears the box.
function ProductSearch({ slot, onPick, disabled }: { slot: string; onPick: (p: PromoProduct) => void; disabled: boolean }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<PromoProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (term: string) => {
    if (!term.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(term)}`)
      const data = await res.json()
      setResults((data.products ?? []).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug, images: p.images, price: p.price })))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(q), 300)
    return () => clearTimeout(t)
  }, [q, search])

  // Close the dropdown on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888]" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder="Search products to add…"
          className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-card)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-[#C9A84C]/50 disabled:opacity-60"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#888]" />}
      </div>

      {open && q.trim() && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-lg shadow-xl">
          {results.length === 0 && !loading ? (
            <p className="px-3 py-3 text-sm text-[#555]">No matching products.</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onClick={() => { onPick(p); setQ(''); setResults([]); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-primary)] text-left"
              >
                <div className="h-9 w-9 rounded bg-[var(--bg-card)] overflow-hidden shrink-0">
                  <img src={firstImage(p.images)} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="flex-1 min-w-0 text-sm text-[var(--text-primary)] truncate">{p.name}</span>
                <span className="text-xs text-[#C9A84C] shrink-0">{formatTTD(p.price)}</span>
                <Plus className="h-4 w-4 text-[#C9A84C] shrink-0" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
