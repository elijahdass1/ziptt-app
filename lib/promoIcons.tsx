// Shared registry of the lucide icons an admin can attach to a homepage promo
// (ticker lines, banner/hero eyebrows). We whitelist a fixed set rather than
// accept any icon name so the bundle only pulls these and an unknown/typo name
// degrades to a sensible default instead of crashing the render.
import {
  Truck, Sparkles, Wallet, Zap, Wine, MapPin, Headphones,
  Tag, Clock, Flame, Star, Gift, Percent, ShoppingBag, Crown,
  Home, Gamepad2, TrendingUp, type LucideIcon,
} from 'lucide-react'

export const PROMO_ICONS: Record<string, LucideIcon> = {
  Truck, Sparkles, Wallet, Zap, Wine, MapPin, Headphones,
  Tag, Clock, Flame, Star, Gift, Percent, ShoppingBag, Crown,
  Home, Gamepad2, TrendingUp,
}

// Order shown in the admin icon picker.
export const PROMO_ICON_NAMES = Object.keys(PROMO_ICONS)

// Resolve a stored icon name to its component, falling back to Sparkles so a
// missing/renamed icon never breaks the page.
export function getPromoIcon(name?: string | null): LucideIcon {
  return (name && PROMO_ICONS[name]) || Sparkles
}
