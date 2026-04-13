import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#C9A84C]/20 text-[#9A8F7A] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-0.5 mb-3">
              <span className="text-2xl font-black gold-shimmer">zip</span>
              <span className="text-2xl font-black text-[#F5F0E8]">.tt</span>
            </Link>
            <p className="text-sm text-[#9A8F7A] leading-relaxed">
              Trinidad &amp; Tobago&apos;s premier online marketplace. Shop local, support local vendors, and get it delivered to your door.
            </p>
            <div className="flex gap-3 mt-4 items-center">
              <span className="emoji-icon text-xl">🇹🇹</span>
              <div>
                <p className="text-xs text-[#9A8F7A]">Delivering across Trinidad</p>
                <p className="text-xs font-medium text-[#F5F0E8]">POS &middot; Central &middot; South</p>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {['Electronics', 'Fashion', 'Carnival & Mas', 'Rum & Spirits', 'Home & Garden', 'Toys & Games'].map((cat) => (
                <li key={cat}>
                  <Link href={`/products?category=${cat.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                    className="hover:text-[#C9A84C] transition-colors">{cat}</Link>
                </li>
              ))}
              <li>
                <Link href="/digital" className="hover:text-[#C9A84C] transition-colors flex items-center gap-1">
                  <span className="emoji-icon">⚡</span> Digital Products
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
            <div className="mt-4 p-3 bg-[#1A1A1A] rounded-lg border border-[#C9A84C]/10">
              <p className="text-xs text-[#9A8F7A] mb-2">Payment Methods</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="badge-gray text-xs flex items-center gap-1"><span className="emoji-icon">💰</span> Cash on Delivery</span>
                <span className="badge-gray text-xs flex items-center gap-1"><span className="emoji-icon">💳</span> Linx</span>
                <span className="badge-gray text-xs flex items-center gap-1"><span className="emoji-icon">🏦</span> Online Banking</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#C9A84C]/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9A8F7A]">
            &copy; {new Date().getFullYear()} zip.tt &mdash; Made with care in Trinidad &amp; Tobago
          </p>
          <div className="flex gap-6 text-xs text-[#9A8F7A]">
            <Link href="/privacy" className="hover:text-[#C9A84C] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C9A84C] transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-[#C9A84C] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
