'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { ShoppingCart, Search, User, Package, ChevronDown, Menu, X, Store, Settings, Smartphone, Shirt, Tag, Sparkles, Star, Wine, Home, Zap } from 'lucide-react'
import { useCartStore } from '@/lib/store'

type IconComponent = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

export function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0))

  const categories: { name: string; href: string; Icon: IconComponent }[] = [
    { name: 'Electronics', href: '/products?category=electronics', Icon: Smartphone },
    { name: 'Fashion', href: '/products?category=fashion', Icon: Shirt },
    { name: 'Streetwear', href: '/products?category=urban-fashion', Icon: Tag },
    { name: 'Carnival & Mas', href: '/products?category=carnival', Icon: Sparkles },
    { name: 'Toys & Kids', href: '/products?category=toys', Icon: Star },
    { name: 'Rum & Spirits', href: '/products?category=rum-spirits', Icon: Wine },
    { name: 'Home & Garden', href: '/products?category=home-garden', Icon: Home },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-[#C9A84C]/20 shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
      {/* Top bar */}
      <div className="bg-[#C9A84C] text-[#0A0A0A] text-xs py-1.5 text-center font-semibold flex items-center justify-center gap-1.5">
        <span className="inline-flex items-center justify-center bg-[#0A0A0A] text-[#C9A84C] text-[9px] font-black px-1 py-0.5 rounded leading-none">TT</span>
        Free delivery on orders over TTD $500 across Trinidad
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-2xl font-black gold-shimmer">zip</span>
            <span className="text-2xl font-black text-[#F5F0E8]">.tt</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden sm:block">
            <form action="/products" method="get">
              <div className="relative">
                <input
                  name="q"
                  type="text"
                  placeholder="Search products, vendors..."
                  className="w-full pl-4 pr-12 py-2.5 bg-[#1A1A1A] border border-[#C9A84C]/30 rounded-full text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                />
                <button type="submit" className="absolute right-1 top-1 p-1.5 bg-[#C9A84C] text-[#0A0A0A] rounded-full hover:bg-[#F0C040] transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-[#C9A84C]/10 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 text-[#F5F0E8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-[#0A0A0A] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Orders */}
            {session && (
              <Link href="/orders" className="hidden sm:flex p-2 hover:bg-[#C9A84C]/10 rounded-full transition-colors">
                <Package className="h-5 w-5 text-[#F5F0E8]" />
              </Link>
            )}

            {/* User menu */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-[#C9A84C]/10 rounded-full transition-colors"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-[#C9A84C]/40" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-[#C9A84C] text-[#0A0A0A] text-xs font-bold flex items-center justify-center">
                      {session.user.name?.[0] ?? 'U'}
                    </div>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-[#9A8F7A] hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#111111] rounded-xl shadow-2xl border border-[#C9A84C]/20 py-1 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}>
                    <div className="px-4 py-2.5 border-b border-[#C9A84C]/10">
                      <p className="text-sm font-semibold text-[#F5F0E8] truncate">{session.user.name}</p>
                      <p className="text-xs text-[#9A8F7A] truncate">{session.user.email}</p>
                    </div>
                    <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm text-[#9A8F7A] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
                      <User className="h-4 w-4" /> My Account
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-[#9A8F7A] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    {(session.user.role === 'VENDOR' || session.user.role === 'ADMIN') && (
                      <Link href="/vendor" className="flex items-center gap-2 px-4 py-2 text-sm text-[#9A8F7A] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
                        <Store className="h-4 w-4" /> Vendor Dashboard
                      </Link>
                    )}
                    {session.user.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-[#9A8F7A] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5" onClick={() => setUserMenuOpen(false)}>
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
                <Link href="/auth/login" className="text-sm font-medium text-[#9A8F7A] hover:text-[#C9A84C] transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-[#C9A84C] text-[#0A0A0A] px-4 py-1.5 rounded-full hover:bg-[#F0C040] transition-colors">
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-2 hover:bg-[#C9A84C]/10 rounded-full"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5 text-[#F5F0E8]" /> : <Menu className="h-5 w-5 text-[#F5F0E8]" />}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden sm:flex items-center gap-1 pb-2 overflow-x-auto">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#9A8F7A] hover:text-[#C9A84C] hover:bg-[#C9A84C]/8 rounded-full whitespace-nowrap transition-colors"
            >
              <cat.Icon size={13} strokeWidth={1.5} /> {cat.name}
            </Link>
          ))}
          <Link
            href="/digital"
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 rounded-full whitespace-nowrap hover:bg-[#C9A84C]/20 transition-colors"
          >
            <Zap size={12} strokeWidth={1.5} /> Digital
          </Link>
          <Link href="/products" className="ml-auto px-3 py-1 text-xs font-medium text-[#C9A84C] hover:underline whitespace-nowrap">
            All Categories
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[#C9A84C]/20 bg-[#111111] px-4 py-4 space-y-3">
          <form action="/products" method="get">
            <div className="relative">
              <input name="q" type="text" placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2.5 bg-[#1A1A1A] border border-[#C9A84C]/30 rounded-full text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
              <button type="submit" className="absolute right-1 top-1 p-1.5 bg-[#C9A84C] text-[#0A0A0A] rounded-full">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#9A8F7A] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 rounded-lg">
                <cat.Icon size={14} strokeWidth={1.5} /> {cat.name}
              </Link>
            ))}
          </div>
          {!session && (
            <div className="flex gap-2 pt-2 border-t border-[#C9A84C]/10">
              <Link href="/auth/login" className="flex-1 text-center py-2 text-sm font-medium border border-[#C9A84C]/40 text-[#C9A84C] rounded-lg" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/auth/register" className="flex-1 text-center py-2 text-sm font-semibold bg-[#C9A84C] text-[#0A0A0A] rounded-lg" onClick={() => setMobileOpen(false)}>Join Free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
