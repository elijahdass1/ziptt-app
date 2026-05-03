// Boot-time validation of required environment variables. Imported
// once from app/layout.tsx so the validation runs as soon as the
// Next.js server starts — that way a missing DATABASE_URL fails the
// boot with a clear message instead of producing 500s on the first
// request that hits Prisma.
//
// Variables are split into two tiers:
//
//   REQUIRED — the app cannot function without these. Missing one
//              throws on import.
//   OPTIONAL — feature-flag / nice-to-have. Missing one logs a
//              warning but the app still boots; affected features
//              degrade gracefully (e.g. emails no-op without Resend).
//
// To add a new env var, list it here AND in .env.example so the next
// developer doesn't have to grep the codebase to figure out what to
// set.

const REQUIRED = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
] as const

const OPTIONAL = [
  // Auth
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  // AI
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY',
  // Email
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'ADMIN_NOTIFY_EMAIL',
  // Image uploads
  'UPLOADTHING_SECRET',
  'UPLOADTHING_APP_ID',
  // Payments (sandbox is fine without these)
  'WIPAY_ACCOUNT_NUMBER',
  'WIPAY_API_KEY',
  'WIPAY_ENV',
  // Feature flags
  'NEXT_PUBLIC_CHAT_ENABLED',
] as const

export type RequiredEnvVar = typeof REQUIRED[number]
export type OptionalEnvVar = typeof OPTIONAL[number]

let validated = false

/**
 * Validate the environment. Idempotent — only runs the check once per
 * process. Call from app/layout.tsx (or anywhere that runs on every
 * server boot) so the failure surfaces as early as possible.
 */
export function validateEnv(): void {
  if (validated) return
  validated = true

  // During `next build`, Vercel sometimes inlines the build step
  // before runtime env is injected. We detect "build mode" via NODE_ENV
  // and skip the throw — the runtime invocation will catch real misses.
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
  if (isBuildPhase) return

  const missing: string[] = []
  for (const k of REQUIRED) {
    const v = process.env[k]
    if (!v || v.trim() === '') missing.push(k)
  }

  if (missing.length) {
    const msg = [
      `[ziptt] missing required env vars: ${missing.join(', ')}`,
      `If this is a Vercel deployment, check Settings → Environment Variables`,
      `for ALL three environments (Production, Preview, Development).`,
      `See .env.example for the full list.`,
    ].join('\n  ')
    throw new Error(msg)
  }

  // Soft warnings for the optional set so the dev terminal makes it
  // obvious which features are running in degraded mode.
  for (const k of OPTIONAL) {
    if (!process.env[k] || process.env[k]!.trim() === '') {
      console.warn(`[ziptt] env: ${k} is not set — related feature is disabled or in fallback mode`)
    }
  }
}

/**
 * Type-safe accessor that throws if a required var is missing. Use this
 * inside route handlers if you want to fail loudly rather than `??` to
 * a silent fallback.
 */
export function requireEnv(name: RequiredEnvVar): string {
  const v = process.env[name]
  if (!v) throw new Error(`[ziptt] env var ${name} is not set`)
  return v
}
