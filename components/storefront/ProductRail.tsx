// Amazon-style horizontal product carousel. A single row that scrolls
// horizontally on overflow with snap-to-card behaviour. We use native
// scroll + scrollbar-thin so it works on touch and trackpad without a
// JS slider lib.
//
// The cards are rendered as plain ProductCards but constrained to a
// fixed width inside the rail so the row reads as a uniform strip.
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/storefront/ProductCard'

type Product = React.ComponentProps<typeof ProductCard>['product']

interface Props {
  title: string
  subtitle?: string
  href?: string
  products: Product[]
}

export function ProductRail({ title, subtitle, href, products }: Props) {
  if (products.length === 0) return null
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
          {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors shrink-0"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-thin -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-2">
        <div className="flex gap-4 snap-x snap-mandatory">
          {products.map((p) => (
            <div
              key={p.id}
              className="snap-start shrink-0 w-[180px] sm:w-[200px] md:w-[220px]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
