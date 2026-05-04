import Link from 'next/link'
import { Cloud, Wallet, CreditCard, Building2, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[#C9A84C]/20 text-[var(--text-secondary)] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-0.5 mb-3">
              <span className="text-2xl font-black gold-shimmer">zip</span>
              <span className="text-2xl font-black text-[var(--text-primary)]">.tt</span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Trinidad &amp; Tobago&apos;s premier online marketplace. Shop local, support local vendors, and get it delivered to your door.
            </p>
            <div className="flex gap-3 mt-4 items-center">
              <span className="h-9 w-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-[#C9A84C]" />
              </span>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Delivering across Trinidad</p>
                <p className="text-xs font-medium text-[var(--text-primary)]">POS &middot; Central &middot; South</p>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Electronics',    slug: 'electronics' },
                { label: 'Fashion',        slug: 'fashion' },
                { label: 'Carnival & Mas', slug: 'carnival' },
                { label: 'Rum & Spirits',  slug: 'rum-spirits' },
                { label: 'Home & Garden',  slug: 'home-garden' },
                { label: 'Toys & Games',   slug: 'toys' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.slug}`}
                    className="hover:text-[#C9A84C] transition-colors">{cat.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/digital" className="hover:text-[#C9A84C] transition-colors flex items-center gap-1.5">
                  <Cloud className="h-3.5 w-3.5" /> Digital Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help/delivery" className="hover:text-[#C9A84C] transition-colors">Delivery Info</Link></li>
              <li><Link href="/help/returns" className="hover:text-[#C9A84C] transition-colors">Returns &amp; Refunds</Link></li>
              <li><Link href="/help/payments" className="hover:text-[#C9A84C] transition-colors">Payment Options</Link></li>
              <li><Link href="/help/tracking" className="hover:text-[#C9A84C] transition-colors">Track My Order</Link></li>
              <li><Link href="/help/contact" className="hover:text-[#C9A84C] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold mb-4">Sell on zip.tt</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/vendor/register" className="hover:text-[#C9A84C] transition-colors">Start Selling</Link></li>
              <li><Link href="/vendor" className="hover:text-[#C9A84C] transition-colors">Vendor Dashboard</Link></li>
              <li><Link href="/help/vendor-fees" className="hover:text-[#C9A84C] transition-colors">Fees &amp; Commission</Link></li>
              <li><Link href="/help/vendor-guide" className="hover:text-[#C9A84C] transition-colors">Seller Guide</Link></li>
            </ul>
            <div className="mt-4 p-3 bg-[var(--bg-card)] rounded-lg border border-[#C9A84C]/10">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Payment Methods</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="badge-gray text-xs flex items-center gap-1.5"><Wallet className="h-3 w-3" /> Cash on Delivery</span>
                <span className="badge-gray text-xs flex items-center gap-1.5"><CreditCard className="h-3 w-3" /> Linx</span>
                <span className="badge-gray text-xs flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Online Banking</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#C9A84C]/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} zip.tt &mdash; Made with care in Trinidad &amp; Tobago
          </p>
          <div className="flex gap-6 text-xs text-[var(--text-secondary)]">
            <Link href="/privacy" className="hover:text-[#C9A84C] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C9A84C] transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-[#C9A84C] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
