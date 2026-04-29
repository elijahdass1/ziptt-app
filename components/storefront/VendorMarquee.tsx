// Continuous horizontal strip of vendor names — Times-Square ribbon
// style. Hover any chip and the whole marquee pauses so the visitor
// can click through. Uses the same .ziptt-marquee-track animation as
// the top promo ticker but doubles in width and slows down so it
// reads more like a featured strip than a notification bar.
import Link from 'next/link'
import { Store } from 'lucide-react'

interface VendorRow {
  storeName: string
  slug: string
  logo: string | null
}

interface Props {
  vendors: VendorRow[]
}

export function VendorMarquee({ vendors }: Props) {
  if (vendors.length === 0) return null
  // Duplicate the list so the loop join is invisible.
  const doubled = [...vendors, ...vendors]

  return (
    <section className="relative overflow-hidden border-y border-[#C9A84C]/10 bg-[#0A0A0A]">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="ziptt-marquee-track py-4" style={{ animationDuration: '60s' }}>
        {doubled.map((v, i) => (
          <Link
            key={`${v.slug}-${i}`}
            href={`/store/${v.slug}`}
            className="flex items-center gap-2 mx-3 px-4 py-2 rounded-full bg-[#111111] border border-[#C9A84C]/15 hover:border-[#C9A84C]/45 hover:bg-[#1A1A1A] transition-colors group shrink-0"
          >
            {v.logo ? (
              <img src={v.logo} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <Store className="h-3.5 w-3.5 text-[#C9A84C]" />
            )}
            <span className="text-xs font-semibold text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors whitespace-nowrap">
              {v.storeName}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
