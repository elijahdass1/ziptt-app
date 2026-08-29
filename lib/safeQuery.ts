// Wrap a request-time DB read on a PUBLIC page so a transient Prisma failure
// (e.g. a Neon cold start / connection timeout) renders a degraded empty state
// instead of bubbling into a 500. The error is logged, never swallowed
// silently — so the outage is still visible in Vercel logs.
//
// Use ONLY where an empty result is an acceptable fallback (storefront listings
// and rails). Do NOT use it to paper over failures on pages where a wrong-but-
// successful render would mislead (checkout, order confirmation, admin).
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    console.error(`[ziptt] query failed (${label}) — serving degraded content:`, (e as Error)?.message)
    return fallback
  }
}
