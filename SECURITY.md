# zip.tt security checklist

Running record of the security/backend audit and what's still open.
Stack reality: **Next.js 14 App Router · Prisma 7 · Postgres on Neon ·
NextAuth · Vercel** (no Supabase, so no RLS in the Postgres-policy
sense — ownership is enforced at the Prisma query layer).

## ✅ Already in place

### 1. Ownership scoping (Prisma equivalent of RLS)
Every API route under `app/api/*` calls `getServerSession(authOptions)`
before any DB read/write. Customer-scoped routes filter by
`customerId: session.user.id`; vendor routes filter by `vendorId` of
the session vendor; admin layout (`app/admin/layout.tsx`) and vendor
layout (`app/vendor/layout.tsx`) hard-redirect away from non-matching
roles. Examples:

- `app/api/disputes/route.ts:11–14` — `where: { customerId: session.user.id }`
- `app/api/orders/route.ts:115–120` — `addressId` ownership re-checked before use
- `app/api/admin/orders/route.ts:11–14` — 403 if `session.user.role !== 'ADMIN'`

### 3. Server-side validation on `/api/orders`
Order placement never trusts the client for money or stock:

- Order total is **recomputed** from canonical `Product.price` rows
  (`app/api/orders/route.ts:186–191`); any client-supplied `price` is
  ignored.
- Stock is verified inside the transaction via `updateMany` with a
  `gte` guard so two concurrent orders can't both succeed against the
  same last unit.
- Phone format is re-validated server-side (TT 7-digit / 868 / 1868).
- `paymentMethod` is coerced through `lib/paymentMethods.ts` →
  `ENABLED_METHODS` so a stale or hostile client can't sneak through a
  disabled method.
- Risk scoring on the authoritative total (lines 193–209) blocks
  `riskScore > 80` orders with a 403.

### 4. API key protection
`grep "NEXT_PUBLIC_" -r app/ components/ lib/` returns only
`NEXT_PUBLIC_CHAT_ENABLED` (a boolean feature flag — safe). All
secrets (DATABASE_URL, NEXTAUTH_SECRET, GROQ_API_KEY,
UPLOADTHING_SECRET, WIPAY_API_KEY) are server-only.

### 5. Authorization (not just authentication)
Each protected layout enforces a role match:

- `app/admin/layout.tsx:8–11` — `if (session.user.role !== 'ADMIN') redirect('/auth/login')`
- `app/vendor/layout.tsx` — same pattern with `'VENDOR'`/`'ADMIN'`
- `app/driver/layout.tsx` — same with `'DRIVER'`

API routes additionally re-check the role inside the handler before
mutating data. A logged-in customer hitting `/api/admin/orders` gets
403, not 200-with-empty-list.

### 6. Admin orders dashboard
Live at `/admin/orders`:
- Page: `app/admin/orders/page.tsx`
- Client: `app/admin/orders/AdminOrdersClient.tsx`
- API: `app/api/admin/orders/route.ts` (status / driver / search filters)
- Status changes: `app/api/admin/orders/[id]/status/route.ts`
- Driver assignment: `app/api/admin/orders/[id]/assign/route.ts`

### 9. Tobago messaging
Removed from `components/storefront/PromoTicker.tsx` when we narrowed
the pilot zone to Tunapuna–Piarco–Trincity.

### 10. Digital product delivery
`app/api/digital/purchase/route.ts` already issues a
`prisma.digitalCode` row on purchase, marks it used, sets
`digitalOrder.deliveredCode`, and **returns the code in the response
JSON** so the success page can render it. (Email-on-purchase is
covered under the open #7/#8 items below.)

## 🟡 Just landed in this audit

### 2. Rate limiting — wired up to the high-risk POSTs
`lib/rateLimit.ts` already existed (in-memory token bucket). It was
applied only to OTP send/verify and digital purchase. Just added:

- `/api/orders` POST → 20 / minute / user
- `/api/disputes` POST → 5 / hour / user
- `/api/products/[slug]/reviews` POST → 10 / hour / user

### 11. Zero-rating trust kill
`components/storefront/ProductCard.tsx` no longer renders five empty
stars + `(0)` for unreviewed products. Instead it shows a small
italic "Be the first to review" tag, which deep-links to the product
detail page where the review form lives.

### 7. Vendor order-placed email + dashboard alert
- `lib/email.ts` — Resend REST wrapper (no SDK dep) with a graceful
  no-op fallback that logs the payload to stdout when `RESEND_API_KEY`
  isn't set. Also exposes `emailLayout()` for the gold/black chrome
  every transactional email uses.
- `lib/emailTemplates.ts` — `vendorOrderEmail`, `adminOrderEmail`,
  `digitalDeliveryEmail`. Each returns `{ subject, html }`.
- `app/api/orders/route.ts` — after the `prisma.$transaction` commits,
  fires `sendOrderNotifications()` (fire-and-forget, errors logged but
  never roll back the order) which sends one email per order to the
  vendor's owning user + one to the admin.
- `app/vendor/layout.tsx` now counts orders in `PENDING`/`CONFIRMED`
  state and threads it into `<VendorSidebar unconfirmedOrders={…} />`
  for a red badge on the Orders link.
- `app/vendor/page.tsx` renders a "{N} NEW" alert banner above the
  rest of the dashboard when `unconfirmedOrders > 0`.

### 8. Admin order-placed email
Same `sendOrderNotifications()` helper sends a parallel admin email
to `process.env.ADMIN_NOTIFY_EMAIL` (default
`elijah.dass1@gmail.com`) for every order.

### 10b. Digital delivery email + UI
- `app/(storefront)/digital/success/page.tsx` already shows
  `deliveredCode` with a `<CopyCodeButton>` — verified.
- `app/api/digital/purchase/route.ts` now also fires a fire-and-forget
  email to the customer with the access code and any redemption
  instructions, using `digitalDeliveryEmail` from emailTemplates.

## 🔴 Still open — needs follow-up

### Activate email delivery
Drop these into Vercel env to flip on real send:
- `RESEND_API_KEY` (required — get one at resend.com)
- `RESEND_FROM_EMAIL` (default: `zip.tt <orders@zip.tt>` — needs the
  domain verified in Resend; until then the helper falls back to
  `onboarding@resend.dev`, which only delivers to your Resend account
  email)
- `ADMIN_NOTIFY_EMAIL` (default: `elijah.dass1@gmail.com`)

Until the key is set, every email send no-ops with a console.log so
the order flow still completes locally and on staging.

### 2b. Make rate-limiting durable across serverless instances
The current `lib/rateLimit.ts` is in-memory. On Vercel each lambda
instance has its own counter and cold-starts reset, so a determined
attacker hitting fresh instances can blow past the limit. Production
fix: migrate the helper to `@upstash/ratelimit` backed by Upstash
Redis (~30 min of work + Upstash account).

## Re-running this audit

```sh
# Find any client-exposed env vars
grep -rE "NEXT_PUBLIC_" app/ components/ lib/ --include "*.ts" --include "*.tsx"

# Find API routes missing the session check
grep -L "getServerSession" app/api/**/route.ts

# Find places that trust client-supplied price/total
grep -rE "body\.(price|total|amount)" app/api/

# List all NEXT_PUBLIC_ env vars currently used
grep -hE "process\.env\.NEXT_PUBLIC_[A-Z_]+" -ro app/ components/ lib/ | sort -u
```
