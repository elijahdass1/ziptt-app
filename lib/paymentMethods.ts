export const PAYMENT_METHODS = {
    cod: 'Cash on Delivery',
    linx: 'Linx Card',
    online_banking: 'Online Banking',
} as const

export type PaymentMethod = keyof typeof PAYMENT_METHODS

export function getPaymentMethodLabel(method: string): string {
    return PAYMENT_METHODS[method as PaymentMethod] ?? method
}
