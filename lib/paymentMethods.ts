// Single source of truth for which payment methods are actually live.
// Launching with Cash on Delivery only — Bank Transfer / Linx come later.
// To re-enable a method: add its key to ENABLED_PAYMENT_METHODS below.
// That one line flows through to both the checkout UI (which only
// renders enabled methods) and the order-creation API (which rejects
// anything else server-side).
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: 'Cash on Delivery',
  LINX: 'Linx Card',
  ONLINE_BANKING: 'Online Banking',
} as const

export type PaymentMethod = keyof typeof PAYMENT_METHODS

export const ENABLED_PAYMENT_METHODS = ['CASH_ON_DELIVERY'] as const satisfies readonly PaymentMethod[]

export type EnabledPaymentMethod = (typeof ENABLED_PAYMENT_METHODS)[number]

export function isEnabledPaymentMethod(method: string): method is EnabledPaymentMethod {
  return (ENABLED_PAYMENT_METHODS as readonly string[]).includes(method)
}

export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHODS[method as PaymentMethod] ?? method
}
