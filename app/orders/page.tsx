import { redirect } from 'next/navigation'

// Canonical orders page now lives under /account/orders. Preserve any
// query string (e.g. ?payment=success from the WiPay callback, ?success
// from checkout) so downstream flows keep working.
export default function OrdersRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const qs = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) =>
      v == null ? [] : Array.isArray(v) ? v.map((x) => [k, x] as [string, string]) : [[k, v] as [string, string]]
    )
  ).toString()
  redirect(qs ? `/account/orders?${qs}` : '/account/orders')
}
