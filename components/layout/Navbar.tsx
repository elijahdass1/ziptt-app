'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  ShoppingCart, Search, User, Package, ChevronDown, Menu, X, Store, Settings, MessageSquare,
  Zap, Shirt, Flame, Sparkles, Gamepad2, Wine, Home, Plug, ShoppingBasket, Cloud, type LucideIcon,
} from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { ThemeToggle } from '@/components/ThemeToggle'

// Polls /api/conversations/unread on a slow interval so the badge stays
// roughly fresh without burning requests. Returns 0 when signed out.
function useUnreadMessages(enabled: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!enabled) {
      setCount(0)
      return
    }
    let cancelled = false
    const tick = async () => {
      try {
        const res = await fetch('/api/conversations/unread', { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const { count } = await res.json()
        if (!cancelled) setCount(count ?? 0)
      } catch {/* swallow */}
    }
    tick()
    const interval = setInterval(tick, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [enabled])
  return count
}

const CATEGORIES: { label: string; slug: string; icon: LucideIcon; color: string }[] = [
  { label: 'Electronics',   slug: 'electronics',   icon: Zap,             color: '#4A9EFF' },
  { label: 'Fashion',       slug: 'fashion',        icon: Shirt,           color: '#FF7EB3' },
  { label: 'Streetwear',    slug: 'urban-fashion',  icon: Flame,           color: '#C9A84C' },
  { label: 'Carnival',      slug: 'carnival',       icon: Sparkles,        color: '#FF6B35' },
  { label: 'Toys & Kids',   slug: 'toys',           icon: Gamepad2,        color: '#7EC8E3' },
  { label: 'Rum & Spirits', slug: 'rum-spirits',    icon: Wine,            color: '#B8860B' },
  { label: 'Home & Garden', slug: 'home-garden',    icon: Home,            color: '#4CAF82' },
  { label: 'Appliances',    slug: 'appliances',     icon: Plug,            color: '#9C88FF' },
  { label: 'Groceries',     slug: 'groceries',      icon: ShoppingBasket,  color: '#E8B04B' },
]

export function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0))
  const unreadMessages = useUnreadMessages(!!session)

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[#C9A84C]/20 shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
      {/* Top bar */}
      <div className="bg-[#C9A84C] text-black text-xs py-1.5 text-center font-semibold">
        Free delivery on orders over TTD $500 across Trinidad
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-2xl font-black gold-shimmer">zip</span>
            <span className="text-2xl font-black text-[var(--text-primary)]">.tt</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden sm:block">
            <form action="/products" method="get">
              <div className="relative">
                <input
                  name="q"
                  type="text"
                  placeholder="Search products, vendors..."
                  className="w-full pl-4 pr-12 py-2.5 bg-[var(--bg-card)] border border-[#C9A84C]/30 rounded-full text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                />
                <button type="submit" className="absolute right-1 top-1 p-1.5 bg-[#C9A84C] text-black rounded-full hover:bg-[#F0C040] transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Theme toggle — sits left of cart so it's always reachable
                regardless of sign-in state. */}
            <ThemeToggle />

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-[#C9A84C]/10 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 text-[var(--text-primary)]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Orders */}
            {session && (
              <Link href="/orders" className="hidden sm:flex p-2 hover:bg-[#C9A84C]/10 rounded-full transition-colors">
                <Package className="h-5 w-5 text-[var(--text-primary)]" />
              </Link>
            )}

            {/* User menu */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="relative flex items-center gap-2 p-1.5 hover:bg-[#C9A84C]/10 rounded-full transition-colors"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-[#C9A84C]/40" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-[#C9A84C] text-black text-xs font-bold flex items-center justify-center">
                      {session.user.name?.[0] ?? 'U'}
                    </div>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)] hidden sm:block" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#D62828] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center leading-none ring-2 ring-[var(--bg-primary)]">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[var(--bg-secondary)] rounded-xl shadow-2xl border border-[#C9A84C]/20 py-1 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}>
                    <div className="px-4 py-2.5 border-b border-[#C9A84C]/10">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{session.user.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{session.user.email}</p>
                    </div>
                    <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
                      <User className="h-4 w-4" /> My Account
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    <Link href="/messages" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
                      <MessageSquare className="h-4 w-4" /> Messages
                      {unreadMessages > 0 && (
                        <span className="ml-auto bg-[#D62828] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center leading-none">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </Link>
                    {(session.user.role === 'VENDOR' || session.user.role === 'ADMIN') && (
                      <Link href="/vendor" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
                        <Store className="h-4 w-4" /> Vendor Dashboard
                      </Link>
                    )}
                    {session.user.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
                        <Settings className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-[#C9A84C]/10 mt-1">
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#C9A84C] transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-[#C9A84C] text-black px-4 py-1.5 rounded-full hover:bg-[#F0C040] transition-colors">
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-2 hover:bg-[#C9A84C]/10 rounded-full"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5 text-[var(--text-primary)]" /> : <Menu className="h-5 w-5 text-[var(--text-primary)]" />}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden sm:flex items-center gap-0.5 pb-2 overflow-x-auto scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-md whitespace-nowrap transition-all duration-150"
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110"
                  style={{ color: cat.color }}
                />
                <span className="tracking-wide">{cat.label}</span>
              </Link>
            )
          })}
          <div className="w-px h-4 bg-[#C9A84C]/20 mx-1 shrink-0" />
          <Link
            href="/digital"
            className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25 rounded-md whitespace-nowrap hover:bg-[#C9A84C]/20 transition-all"
          >
            <Cloud className="h-3.5 w-3.5 shrink-0" />
            <span className="tracking-wide">Digital</span>
          </Link>
          <Link
            href="/vendors"
            className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-md whitespace-nowrap transition-all"
          >
            <Store className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
            <span className="tracking-wide">Sellers</span>
          </Link>
          <Link href="/products" className="ml-auto px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[#C9A84C] whitespace-nowrap transition-colors">
            All →
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[#C9A84C]/20 bg-[var(--bg-secondary)] px-4 py-4 space-y-3">
          <form action="/products" method="get">
            <div className="relative">
              <input name="q" type="text" placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2.5 bg-[var(--bg-card)] border border-[#C9A84C]/30 rounded-full text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
              <button type="submit" className="absolute right-1 top-1 p-1.5 bg-[#C9A84C] text-black rounded-full">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link key={cat.slug} href={`/products?category=${encodeURIComponent(cat.slug)}`} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-colors">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: cat.color }} />
                  <span className="text-xs">{cat.label}</span>
                </Link>
              )
            })}
          </div>
          {/* Sellers + Messages — same destinations as the desktop nav so
              mobile users get parity. Messages is gated on signed-in. */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#C9A84C]/10">
            <Link
              href="/vendors"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
            >
              <Store className="h-4 w-4 text-[#C9A84C] shrink-0" />
              <span className="text-xs font-medium">All Sellers</span>
            </Link>
            <Link
              href="/digital"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-lg"
            >
              <Cloud className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium">Digital</span>
            </Link>
            {session && (
              <Link
                href="/messages"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-colors relative"
              >
                <MessageSquare className="h-4 w-4 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-medium">Messages</span>
                {unreadMessages > 0 && (
                  <span className="ml-auto bg-[#D62828] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center leading-none">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
            )}
          </div>
          {!session && (
            <div className="flex gap-2 pt-2 border-t border-[#C9A84C]/10">
              <Link href="/auth/login" className="flex-1 text-center py-2 text-sm font-medium border border-[#C9A84C]/40 text-[#C9A84C] rounded-lg" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/auth/register" className="flex-1 text-center py-2 text-sm font-semibold bg-[#C9A84C] text-black rounded-lg" onClick={() => setMobileOpen(false)}>Join Free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
