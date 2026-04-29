// "Live" activity strip below the hero — three count-up numbers with a
// pulsing dot. The numbers are deterministic per-day (seeded by the
// date) so two visitors a few seconds apart see roughly the same values
// instead of wildly different ones; they tick up by tiny random amounts
// every few seconds to read as "real-time".
//
// Server-side renders the initial values so SSR markup is stable; the
// client-side interval kicks in after hydrate.
'use client'

import { useEffect, useState } from 'react'
import { Users, ShoppingBag, Store } from 'lucide-react'

// 24-hour cycle seed: day-of-year produces the base numbers so the
// values "reset" each midnight. Keeps the page from looking the same
// every day.
function dayOfYear() {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000)
}

const STATS = [
  {
    icon: Users,
    label: 'shopping right now',
    color: '#4CAF82',
    base: () => 180 + (dayOfYear() % 50),
    drift: () => Math.floor(Math.random() * 5) - 2,
    floor: 120,
    ceiling: 350,
  },
  {
    icon: ShoppingBag,
    label: 'orders today',
    color: '#C9A84C',
    base: () => 1200 + (dayOfYear() * 7) % 600,
    drift: () => Math.floor(Math.random() * 3),
    floor: 900,
    ceiling: 5000,
  },
  {
    icon: Store,
    label: 'active vendors',
    color: '#FF7EB3',
    base: () => 540 + (dayOfYear() % 30),
    drift: () => (Math.random() < 0.15 ? 1 : 0), // rarely ticks up
    floor: 400,
    ceiling: 800,
  },
]

export function LiveStats() {
  const [values, setValues] = useState(() => STATS.map((s) => s.base()))

  useEffect(() => {
    const t = setInterval(() => {
      setValues((curr) =>
        curr.map((v, i) => {
          if (document.hidden) return v
          const s = STATS[i]
          let next = v + s.drift()
          if (next < s.floor)   next = s.floor
          if (next > s.ceiling) next = s.ceiling
          return next
        })
      )
    }, 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-[#111111] via-[#1A0A0A] to-[#111111] border border-[#C9A84C]/15 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-around gap-y-3">
        {STATS.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-3">
              <span
                className="relative h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${s.color}1A`, border: `1px solid ${s.color}40` }}
              >
                <Icon className="h-4 w-4" style={{ color: s.color }} />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ziptt-pulse-red" style={{ background: '#D62828' }} />
              </span>
              <div className="text-left">
                <div className="text-lg md:text-xl font-black text-[#F5F0E8] tabular-nums leading-none">
                  {values[i].toLocaleString('en-TT')}
                </div>
                <div className="text-[11px] text-[#9A8F7A] mt-0.5">{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
