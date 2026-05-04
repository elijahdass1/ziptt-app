'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2,
  Store, Settings, LogOut, ChevronRight, PlusCircle, ImagePlus, MessageSquare, Cloud,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Vendor {
  storeName: string
  logo?: string | null
  rating: number
  status: string
}

const navItems = [
  { href: '/vendor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/vendor/dashboard', label: 'New Dashboard', icon: LayoutDashboard, exact: false },
  { href: '/vendor/products', label: 'Products', icon: Package },
  { href: '/vendor/products/new', label: 'Add Product', icon: PlusCircle },
  { href: '/vendor/products/needs-photos', label: 'Fix Photos', icon: ImagePlus, badgeKey: 'needsPhotos' as const },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'unconfirmedOrders' as const },
  { href: '/vendor/digital/orders', label: 'Digital Orders', icon: Cloud },
  // Customer chat inbox — same /messages route as customers, but the SSR
  // logic auto-includes the vendor's threads. Badge mirrors the count
  // that the vendor layout fetched.
  { href: '/messages', label: 'Inbox', icon: MessageSquare, badgeKey: 'unreadMessages' as const },
  { href: '/vendor/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/vendor/settings', label: 'Store Settings', icon: Settings },
]

export function VendorSidebar({
  vendor,
  needsPhotosCount = 0,
  unreadMessages = 0,
  unconfirmedOrders = 0,
}: {
  vendor: Vendor | null
  needsPhotosCount?: number
  unreadMessages?: number
  unconfirmedOrders?: number
}) {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[var(--bg-primary)] border-r border-[#C9A84C]/15 flex flex-col shrink-0 sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-[#C9A84C]/10">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-black gold-shimmer">zip</span>
          <span className="text-xl font-black text-[var(--text-primary)]">.tt</span>
        </Link>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Vendor Portal</p>
      </div>

      {/* Store info */}
      {vendor && (
        <div className="p-4 border-b border-[#C9A84C]/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0">
              {vendor.logo ? (
                <img src={vendor.logo} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <Store className="h-5 w-5 text-[#C9A84C]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{vendor.storeName}</p>
              <p className="text-xs text-[#C9A84C]">{vendor.rating.toFixed(1)} rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          // Skip "Fix Photos" entirely if the vendor has zero bad photos —
          // no need to draw attention to a non-issue.
          if (item.badgeKey === 'needsPhotos' && needsPhotosCount === 0) return null

          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== '/vendor/products/new'
          const badgeValue =
            item.badgeKey === 'needsPhotos' ? needsPhotosCount
            : item.badgeKey === 'unreadMessages' ? unreadMessages
            : item.badgeKey === 'unconfirmedOrders' ? unconfirmedOrders
            : 0

          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-l-[3px] border-[#C9A84C] pl-[9px]'
                  : 'text-[var(--text-secondary)] hover:bg-[#C9A84C]/5 hover:text-[var(--text-primary)]'
              )}>
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badgeValue > 0 && (
                <span className="bg-[#D62828] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
                  {badgeValue > 99 ? '99+' : badgeValue}
                </span>
              )}
              {active && !badgeValue && <ChevronRight className="h-3.5 w-3.5 ml-auto text-[#C9A84C]" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[#C9A84C]/10 space-y-1">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5">
          <Store className="h-4 w-4" /> View Storefront
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-red-900/20 hover:text-red-400 transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
