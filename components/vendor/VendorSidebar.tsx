'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2,
  Store, Settings, LogOut, ChevronRight, PlusCircle,
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
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/vendor/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/vendor/settings', label: 'Store Settings', icon: Settings },
]

export function VendorSidebar({ vendor }: { vendor: Vendor | null }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[#0A0A0A] border-r border-[#C9A84C]/15 flex flex-col shrink-0 sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-[#C9A84C]/10">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-black gold-shimmer">zip</span>
          <span className="text-xl font-black text-[#F5F0E8]">.tt</span>
        </Link>
        <p className="text-xs text-[#9A8F7A] mt-0.5">Vendor Portal</p>
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
              <p className="text-sm font-semibold text-[#F5F0E8] truncate">{vendor.storeName}</p>
              <p className="text-xs text-[#C9A84C]">⭐ {vendor.rating.toFixed(1)} rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/vendor/products/new'
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-l-[3px] border-[#C9A84C] pl-[9px]'
                  : 'text-[#9A8F7A] hover:bg-[#C9A84C]/5 hover:text-[#F5F0E8]'
              )}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-[#C9A84C]" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[#C9A84C]/10 space-y-1">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9A8F7A] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5">
          <Store className="h-4 w-4" /> View Storefront
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9A8F7A] hover:bg-red-900/20 hover:text-red-400 transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
