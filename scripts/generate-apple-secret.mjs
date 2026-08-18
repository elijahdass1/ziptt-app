// Generate the Apple "Sign in with Apple" client secret (an ES256 JWT).
//
// Apple does not give you a static client secret — you sign a short-lived JWT
// with the private key from the .p8 file you download in the Apple Developer
// portal. It may live at most 6 months; this script mints a 180-day one. When
// it expires, sign-in starts returning "invalid_client" — just re-run this and
// paste the new value into Vercel → Settings → Environment Variables → APPLE_SECRET,
// then redeploy.
//
// Uses `jose` (already a transitive dependency via next-auth) so there is
// nothing extra to install.
//
// ── Usage ──────────────────────────────────────────────────────────────────
//   Set these four env vars (locally, e.g. in .env.local, NOT committed), then:
//     node scripts/generate-apple-secret.mjs
//
//   APPLE_ID          Services ID, e.g. tt.zip.signin   (this is the client_id)
//   APPLE_TEAM_ID     10-char Team ID (Apple Developer → Membership)
//   APPLE_KEY_ID      10-char Key ID of the "Sign in with Apple" key
//   APPLE_PRIVATE_KEY Contents of the .p8 file. Either paste the real newlines,
//                     or a single line with literal \n escapes — both work.
//
// The script prints the JWT. Copy it into Vercel as APPLE_SECRET.

import { SignJWT, importPKCS8 } from 'jose'

const { APPLE_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY } = process.env

const missing = ['APPLE_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_PRIVATE_KEY'].filter(
  (k) => !process.env[k]
)
if (missing.length) {
  console.error(`\n  Missing required env var(s): ${missing.join(', ')}\n`)
  console.error('  Set them (e.g. in .env.local) and re-run: node scripts/generate-apple-secret.mjs\n')
  process.exit(1)
}

// Accept the .p8 either with real newlines or with literal "\n" sequences.
const pkcs8 = APPLE_PRIVATE_KEY.replace(/\\n/g, '\n')

const key = await importPKCS8(pkcs8, 'ES256')

const now = Math.floor(Date.now() / 1000)
const SIX_MONTHS = 60 * 60 * 24 * 180

const jwt = await new SignJWT({})
  .setProtectedHeader({ alg: 'ES256', kid: APPLE_KEY_ID })
  .setIssuer(APPLE_TEAM_ID)
  .setIssuedAt(now)
  .setExpirationTime(now + SIX_MONTHS)
  .setAudience('https://appleid.apple.com')
  .setSubject(APPLE_ID)
  .sign(key)

const expDate = new Date((now + SIX_MONTHS) * 1000).toISOString().slice(0, 10)

console.log(`\n  Apple client secret (valid until ${expDate}):\n`)
console.log(jwt)
console.log('\n  → Paste this into Vercel as APPLE_SECRET, then redeploy.\n')
