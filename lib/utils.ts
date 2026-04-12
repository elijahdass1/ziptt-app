import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTTD(amount: number): string {
  return new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency: 'TTD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-TT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Delivery is restricted to these areas only.
 * Due to crime rates in certain parts of T&T, zip.tt currently delivers
 * exclusively to established residential and commercial zones.
 */
export const DELIVERY_REGIONS = [
  'Port of Spain',
  'Maraval',
  'Westmoorings',
  'Diego Martin',
  'Carenage',
  'Champ Fleurs',
  'Valsayn',
  'Tunapuna',
  'Trincity',
  'Arima',
  'Chaguanas',
  'Couva',
  'San Fernando',
] as const

export type DeliveryRegion = (typeof DELIVERY_REGIONS)[number]

export function getDeliveryEstimate(region: string): string {
  const fast = ['Port of Spain', 'Maraval', 'Westmoorings', 'Diego Martin', 'Carenage', 'Champ Fleurs', 'Valsayn']
  if (fast.includes(region)) return '1–2 business days'
  return '2–3 business days'
}
