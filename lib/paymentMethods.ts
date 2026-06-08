export const PAYMENT_METHODS = {
    cod: 'Cash on Delivery',
    linx: 'Linx Card',
    online_banking: 'Online Banking',
} as const

export type PaymentMethod = keyof typeof PAYMENT_METHODS

// Server-side allowlist — any method not here gets coerced to CASH_ON_DELIVERY.
export const ENABLED_METHODS = new Set([
  'CASH_ON_DELIVERY',
  'LINX',
  'ONLINE_BANKING',
] as const)

export function getPaymentMethodLabel(method: string): string {
    return PAYMENT_METHODS[method as PaymentMethod] ?? method
}
