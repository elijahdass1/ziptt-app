// Thin wrapper around Resend's REST API. We talk to it via fetch
// (no SDK dependency) so the only env lift to go live is dropping
// RESEND_API_KEY into Vercel.
//
// Without RESEND_API_KEY the helper logs the email payload to stdout
// instead of throwing — that way the order/purchase flow still
// completes during development and you can verify the wiring before
// signing up for Resend.
//
// The `from` address must be verified in Resend before production
// mail will deliver. Until you verify a domain, fall back to
// `onboarding@resend.dev` (Resend's catch-all that only delivers to
// the address attached to the Resend account — fine for solo dev).
//
// Drop these into Vercel env when you're ready:
//   RESEND_API_KEY            (required to actually send)
//   RESEND_FROM_EMAIL         (default: orders@zip.tt — needs domain verified)
//   ADMIN_NOTIFY_EMAIL        (default: elijah.dass1@gmail.com — gets every order email)
//
// Public signature:
//   await sendEmail({ to, subject, html, replyTo? })
//
// Returns { ok: boolean, id?: string, error?: string } and never throws.
// Callers should treat email failure as non-fatal — we never want a
// flaky transactional email to abort an order placement.

export type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  // Override the from address when needed. Defaults to RESEND_FROM_EMAIL.
  from?: string
}

export type SendEmailResult = {
  ok: boolean
  id?: string
  error?: string
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'zip.tt <orders@zip.tt>'
const DEFAULT_FALLBACK_FROM = 'zip.tt <onboarding@resend.dev>'

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY
  const from = input.from ?? process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM

  // Dev / unconfigured fallback: log and pretend to send. This keeps
  // the order flow happy locally and lets you verify the email payload
  // shape before you have a Resend key.
  if (!key) {
    console.log('[email] (no RESEND_API_KEY — dry-run)', {
      to: input.to,
      subject: input.subject,
      bytes: input.html.length,
    })
    return { ok: true, id: 'dry-run' }
  }

  try {
    const r = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    })
    if (!r.ok) {
      const errBody = await r.text().catch(() => '')
      // If the configured `from` domain isn't verified yet, retry once
      // with the safe Resend onboarding sender so admin/dev emails
      // still land. Production should fix the underlying DNS.
      if (r.status === 403 && from !== DEFAULT_FALLBACK_FROM && !input.from) {
        console.warn('[email] from-domain rejected, retrying with onboarding@resend.dev')
        return sendEmail({ ...input, from: DEFAULT_FALLBACK_FROM })
      }
      console.warn('[email] resend non-2xx:', r.status, errBody)
      return { ok: false, error: `${r.status} ${errBody.slice(0, 200)}` }
    }
    const data = (await r.json().catch(() => null)) as { id?: string } | null
    return { ok: true, id: data?.id }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn('[email] resend threw:', msg)
    return { ok: false, error: msg }
  }
}

// ─── Branded HTML wrapper used by every transactional email ─────────
// Keeps the template surface tiny: callers pass a body string and an
// optional CTA, this wraps it in zip.tt's gold-on-black chrome.
export function emailLayout(opts: {
  preheader?: string
  heading: string
  body: string  // arbitrary HTML
  cta?: { label: string; url: string }
  footer?: string
}): string {
  const cta = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
         <tr><td style="background:#C9A84C;border-radius:8px;">
           <a href="${opts.cta.url}" style="display:inline-block;padding:12px 28px;font-family:Inter,Arial,sans-serif;font-weight:700;font-size:14px;color:#0A0A0A;text-decoration:none;">${opts.cta.label}</a>
         </td></tr>
       </table>`
    : ''

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(opts.heading)}</title>
</head>
<body style="margin:0;padding:24px;background:#0A0A0A;color:#F5F0E8;font-family:Inter,Arial,sans-serif;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(opts.preheader)}</div>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="max-width:560px;width:100%;background:#111111;border:1px solid rgba(201,168,76,0.2);border-radius:14px;overflow:hidden;">
  <tr><td style="padding:24px 28px 0;">
    <div style="font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#C9A84C;">zip.tt</div>
    <div style="font-size:11px;color:#9A8F7A;text-transform:uppercase;letter-spacing:2px;margin-top:2px;">Trinidad &amp; Tobago marketplace</div>
  </td></tr>
  <tr><td style="padding:20px 28px 8px;">
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#F5F0E8;">${escapeHtml(opts.heading)}</h1>
    <div style="font-size:14px;line-height:1.55;color:#9A8F7A;">${opts.body}</div>
    ${cta}
  </td></tr>
  <tr><td style="padding:16px 28px 24px;border-top:1px solid rgba(201,168,76,0.12);font-size:11px;color:#6E665A;line-height:1.55;">
    ${opts.footer ?? 'You\'re receiving this because you have an account on zip.tt. Reply to this email if you need help.'}
  </td></tr>
</table>
</body></html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? 'elijah.dass1@gmail.com'
