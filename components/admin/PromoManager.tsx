'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { PROMO_ICON_NAMES, getPromoIcon } from '@/lib/promoIcons'
import { Plus, Trash2, Loader2, Save, Eye, EyeOff } from 'lucide-react'

export type Promo = {
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

type Slot = 'HERO' | 'BANNER' | 'TICKER'

// Which fields each slot exposes, and the order they render in.
const SLOT_META: Record<Slot, { label: string; desc: string; fields: (keyof Promo)[] }> = {
  HERO: {
    label: 'Hero',
    desc: 'The big headline block at the top. Only the first active hero is shown.',
    fields: ['eyebrow', 'title', 'titleAccent', 'subtitle', 'ctaLabel', 'ctaHref', 'cta2Label', 'cta2Href'],
  },
  BANNER: {
    label: 'Mid-page banner',
    desc: 'The poster-style promo band mid-page. Only the first active banner is shown.',
    fields: ['eyebrow', 'icon', 'accent', 'title', 'titleAccent', 'subtitle', 'ctaLabel', 'ctaHref', 'cta2Label', 'cta2Href'],
  },
  TICKER: {
    label: 'Ticker',
    desc: 'The scrolling strip under the navbar. Every active line shows, ordered by sort order.',
    fields: ['icon', 'title'],
  },
}

const FIELD_LABEL: Record<string, string> = {
  eyebrow: 'Eyebrow (small label above the title)',
  title: 'Title',
  titleAccent: 'Title accent (gold second line)',
  subtitle: 'Subtitle / body text',
  icon: 'Icon',
  accent: 'Accent colour (hex, e.g. #D62828)',
  ctaLabel: 'Button 1 label',
  ctaHref: 'Button 1 link (e.g. /products?category=carnival)',
  cta2Label: 'Button 2 label',
  cta2Href: 'Button 2 link',
}

const SLOTS: Slot[] = ['HERO', 'BANNER', 'TICKER']

function blankDraft(slot: Slot): Promo {
  return {
    id: `new-${Math.random().toString(36).slice(2)}`,
    slot,
    active: true,
    sortOrder: 0,
    eyebrow: null, title: null, titleAccent: null, subtitle: null,
    icon: null, accent: null, ctaLabel: null, ctaHref: null, cta2Label: null, cta2Href: null,
  }
}

export function PromoManager({ initialPromos }: { initialPromos: Promo[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<Promo[]>(initialPromos)
  const [busyId, setBusyId] = useState<string | null>(null)

  const isNew = (id: string) => id.startsWith('new-')

  function patchRow(id: string, patch: Partial<Promo>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function addRow(slot: Slot) {
    setRows((rs) => [...rs, blankDraft(slot)])
  }

  async function save(row: Promo) {
    setBusyId(row.id)
    try {
      const url = isNew(row.id) ? '/api/admin/promos' : `/api/admin/promos/${row.id}`
      const method = isNew(row.id) ? 'POST' : 'PATCH'
      // Drop the client-side id; `payload` still carries `slot`, which POST
      // needs and PATCH harmlessly ignores (sanitizePromo doesn't read it).
      const { id: _id, ...payload } = row
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast({ title: isNew(row.id) ? 'Promo created' : 'Promo saved' })
      router.refresh()
      if (isNew(row.id)) {
        const created = await res.json()
        // swap the temp row for the persisted one so subsequent saves PATCH it
        setRows((rs) => rs.map((r) => (r.id === row.id ? created : r)))
      }
    } catch {
      toast({ title: 'Failed to save promo', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  async function toggle(row: Promo) {
    if (isNew(row.id)) {
      patchRow(row.id, { active: !row.active })
      return
    }
    setBusyId(row.id)
    try {
      const res = await fetch(`/api/admin/promos/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !row.active }),
      })
      if (!res.ok) throw new Error()
      patchRow(row.id, { active: !row.active })
      toast({ title: !row.active ? 'Promo shown' : 'Promo hidden' })
      router.refresh()
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  async function remove(row: Promo) {
    if (isNew(row.id)) {
      setRows((rs) => rs.filter((r) => r.id !== row.id))
      return
    }
    if (!confirm('Delete this promo permanently?')) return
    setBusyId(row.id)
    try {
      const res = await fetch(`/api/admin/promos/${row.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setRows((rs) => rs.filter((r) => r.id !== row.id))
      toast({ title: 'Promo deleted' })
      router.refresh()
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-8">
      {SLOTS.map((slot) => {
        const meta = SLOT_META[slot]
        const slotRows = rows.filter((r) => r.slot === slot)
        return (
          <section key={slot} className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{meta.label}</h2>
                <p className="text-xs text-[#888] mt-0.5 max-w-xl">{meta.desc}</p>
              </div>
              <button
                onClick={() => addRow(slot)}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" /> Add {slot === 'TICKER' ? 'line' : meta.label.toLowerCase()}
              </button>
            </div>

            {slotRows.length === 0 ? (
              <p className="text-sm text-[#555] py-4">
                None configured — the homepage shows the built-in default for this slot.
              </p>
            ) : (
              <div className="space-y-4">
                {slotRows.map((row) => (
                  <PromoCard
                    key={row.id}
                    row={row}
                    fields={meta.fields}
                    busy={busyId === row.id}
                    isTicker={slot === 'TICKER'}
                    onChange={(patch) => patchRow(row.id, patch)}
                    onSave={() => save(row)}
                    onToggle={() => toggle(row)}
                    onDelete={() => remove(row)}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function PromoCard({
  row, fields, busy, isTicker, onChange, onSave, onToggle, onDelete,
}: {
  row: Promo
  fields: (keyof Promo)[]
  busy: boolean
  isTicker: boolean
  onChange: (patch: Partial<Promo>) => void
  onSave: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const inputCls =
    'w-full bg-[var(--bg-primary)] border border-[var(--bg-card)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#C9A84C]/50'

  return (
    <div className={`border rounded-lg p-4 ${row.active ? 'border-[#C9A84C]/30' : 'border-[var(--bg-card)] opacity-70'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${row.active ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-[#333] text-[#888] border border-[#444]'}`}>
          {row.active ? 'Live' : 'Hidden'}
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-[#888]">
            Order
            <input
              type="number"
              value={row.sortOrder}
              onChange={(e) => onChange({ sortOrder: Number(e.target.value) || 0 })}
              className="w-14 bg-[var(--bg-primary)] border border-[var(--bg-card)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[#C9A84C]/50"
            />
          </label>
          <button onClick={onToggle} disabled={busy} title={row.active ? 'Hide' : 'Show'}
            className="p-1.5 rounded-lg border border-[var(--bg-card)] text-[#888] hover:text-[var(--text-primary)] transition-colors">
            {row.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button onClick={onDelete} disabled={busy} title="Delete"
            className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={onSave} disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-[#C9A84C] text-black font-medium hover:bg-[#F0C040] transition-colors disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => {
          const label = isTicker && f === 'title' ? 'Line text' : (FIELD_LABEL[f] ?? f)
          const val = (row[f] ?? '') as string
          const wide = f === 'title' || f === 'subtitle' || f === 'titleAccent'
          if (f === 'icon') {
            return (
              <div key={f}>
                <label className="block text-xs text-[#888] mb-1">{label}</label>
                <select
                  value={val}
                  onChange={(e) => onChange({ icon: e.target.value || null })}
                  className={inputCls}
                >
                  <option value="">— none —</option>
                  {PROMO_ICON_NAMES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )
          }
          if (f === 'accent') {
            return (
              <div key={f}>
                <label className="block text-xs text-[#888] mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={val || '#D62828'}
                    onChange={(e) => onChange({ accent: e.target.value })}
                    className="h-9 w-10 rounded border border-[var(--bg-card)] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={val}
                    placeholder="#D62828"
                    onChange={(e) => onChange({ accent: e.target.value || null })}
                    className={inputCls}
                  />
                </div>
              </div>
            )
          }
          return (
            <div key={f} className={wide ? 'md:col-span-2' : ''}>
              <label className="block text-xs text-[#888] mb-1">{label}</label>
              {f === 'subtitle' ? (
                <textarea
                  value={val}
                  rows={2}
                  onChange={(e) => onChange({ [f]: e.target.value || null } as Partial<Promo>)}
                  className={inputCls}
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => onChange({ [f]: e.target.value || null } as Partial<Promo>)}
                  className={inputCls}
                />
              )}
            </div>
          )
        })}
      </div>

      {isTicker && row.icon && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[#888]">
          Preview:
          <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
            {(() => { const I = getPromoIcon(row.icon); return <I className="h-3.5 w-3.5 text-[#C9A84C]" /> })()}
            {row.title || '(line text)'}
          </span>
        </div>
      )}
    </div>
  )
}
