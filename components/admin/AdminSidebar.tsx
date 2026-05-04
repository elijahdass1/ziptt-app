'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Store, Package, ShieldAlert, Star, LogOut, ChevronRight, BadgeCheck, ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// "Orders" sits between Vendors and Verifications so the operational
// surface (users → vendors → orders → verifications) reads top-down.
const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/vendors', label: 'Vendors', icon: Store },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/verifications', label: 'Verifications', icon: BadgeCheck },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/disputes', label: 'Disputes', icon: ShieldAlert },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[#0A0A0A] border-r border-[#C9A84C]/15 text-[#9A8F7A] flex flex-col shrink-0 sticky top-0 h-screen">
      <div className="p-4 border-b border-[#C9A84C]/10">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-black gold-shimmer">zip</span>
          <span className="text-xl font-black text-[#F5F0E8]">.tt</span>
        </Link>
        <p className="text-xs text-[#9A8F7A] mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
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

      <div className="p-3 border-t border-[#C9A84C]/10">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9A8F7A] hover:bg-red-900/20 hover:text-red-400 transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
