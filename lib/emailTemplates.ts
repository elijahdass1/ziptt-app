// Transactional email templates. Each template returns a fully-
// rendered HTML string by funnelling content through emailLayout in
// lib/email.ts so the chrome (logo, footer, brand colours) stays
// consistent across every send.
//
// Keeping the templates here (and not inline in the API routes) makes
// it easy to preview / iterate on them and to swap in a more
// elaborate templating system later without touching the routes.

import { emailLayout } from './email'
import { formatTTD } from './utils'

type OrderItem = { name: string; quantity: number; price: number }
type OrderEmailCtx = {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  vendorStoreName: string
  total: number
  subtotal: number
  deliveryFee: number
  paymentMethod: string
  items: OrderItem[]
  address: { street: string; city: string; region: string } | null
  instructions: string | null
}

function itemsTable(items: OrderItem[]): string {
  const rows = items.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid rgba(201,168,76,0.1);font-size:13px;color:#F5F0E8;">${escape(i.name)}</td>
      <td style="padding:8px 0;border-bottom:1px solid rgba(201,168,76,0.1);font-size:13px;color:#9A8F7A;text-align:right;">×${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid rgba(201,168,76,0.1);font-size:13px;color:#C9A84C;text-align:right;font-weight:600;">${escape(formatTTD(i.price * i.quantity))}</td>
    </tr>`).join('')
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:8px 0 4px;">
      ${rows}
    </table>`
}

function addressBlock(addr: OrderEmailCtx['address'], instructions: string | null): string {
  if (!addr) return '<p style="color:#9A8F7A;font-size:13px;">No delivery address on file.</p>'
  return `
    <p style="margin:0 0 4px;font-size:13px;color:#F5F0E8;">${escape(addr.street)}, ${escape(addr.city)}</p>
    <p style="margin:0;font-size:13px;color:#9A8F7A;">${escape(addr.region)}, Trinidad</p>
    ${instructions ? `<p style="margin:8px 0 0;font-size:12px;color:#9A8F7A;font-style:italic;">Instructions: ${escape(instructions)}</p>` : ''}`
}

function summaryBlock(ctx: OrderEmailCtx): string {
  return `
    <div style="background:#0A0A0A;border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:14px 16px;margin:12px 0;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#9A8F7A;margin-bottom:4px;">
        <span>Subtotal</span><span>${escape(formatTTD(ctx.subtotal))}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#9A8F7A;margin-bottom:4px;">
        <span>Delivery</span><span>${ctx.deliveryFee === 0 ? 'FREE' : escape(formatTTD(ctx.deliveryFee))}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:14px;color:#F5F0E8;font-weight:700;margin-top:8px;border-top:1px solid rgba(201,168,76,0.2);padding-top:8px;">
        <span>Total</span><span style="color:#C9A84C;">${escape(formatTTD(ctx.total))}</span>
      </div>
    </div>`
}

// ─── Vendor: new order received ───────────────────────────────
export function vendorOrderEmail(ctx: OrderEmailCtx) {
  const body = `
    <p>You have a new order on zip.tt.</p>
    <p style="margin:16px 0 4px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Order #${escape(ctx.orderNumber)}</p>
    <p style="margin:0;color:#9A8F7A;font-size:12px;">From <strong style="color:#F5F0E8;">${escape(ctx.customerName)}</strong> · ${escape(ctx.customerEmail)}${ctx.customerPhone ? ` · ${escape(ctx.customerPhone)}` : ''}</p>
    <p style="margin:18px 0 6px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Items</p>
    ${itemsTable(ctx.items)}
    ${summaryBlock(ctx)}
    <p style="margin:16px 0 6px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Delivery</p>
    ${addressBlock(ctx.address, ctx.instructions)}
    <p style="margin:18px 0 0;color:#9A8F7A;font-size:12px;">Payment method: <strong style="color:#F5F0E8;">${escape(ctx.paymentMethod.replace(/_/g, ' '))}</strong></p>`
  return {
    subject: `New order #${ctx.orderNumber} — ${formatTTD(ctx.total)}`,
    html: emailLayout({
      preheader: `New ${formatTTD(ctx.total)} order on zip.tt — confirm to start fulfilment.`,
      heading: `New order #${ctx.orderNumber}`,
      body,
      cta: { label: 'Confirm order →', url: 'https://ziptt-prod.vercel.app/vendor/orders' },
      footer: `You\'re receiving this because you have a vendor account on zip.tt. Manage notifications in your <a href="https://ziptt-prod.vercel.app/vendor/settings" style="color:#C9A84C;">store settings</a>.`,
    }),
  }
}

// ─── Admin: order placed (platform-wide notification) ─────────
export function adminOrderEmail(ctx: OrderEmailCtx) {
  const body = `
    <p>An order was just placed on the platform.</p>
    <p style="margin:16px 0 4px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Order #${escape(ctx.orderNumber)}</p>
    <p style="margin:0;color:#9A8F7A;font-size:13px;">
      Vendor: <strong style="color:#F5F0E8;">${escape(ctx.vendorStoreName)}</strong><br>
      Customer: ${escape(ctx.customerName)} · ${escape(ctx.customerEmail)}<br>
      Payment: ${escape(ctx.paymentMethod.replace(/_/g, ' '))}
    </p>
    ${itemsTable(ctx.items)}
    ${summaryBlock(ctx)}
    ${addressBlock(ctx.address, ctx.instructions)}`
  return {
    subject: `[admin] Order #${ctx.orderNumber} — ${formatTTD(ctx.total)} via ${ctx.vendorStoreName}`,
    html: emailLayout({
      preheader: `${ctx.vendorStoreName} sold ${formatTTD(ctx.total)} to ${ctx.customerEmail}.`,
      heading: `Order #${ctx.orderNumber}`,
      body,
      cta: { label: 'Open in admin', url: 'https://ziptt-prod.vercel.app/admin/orders' },
      footer: `Sent automatically to platform admins on every order.`,
    }),
  }
}

// ─── Customer: digital code delivered ─────────────────────────
export function digitalDeliveryEmail(ctx: {
  customerName: string
  productName: string
  code: string
  instructions: string | null
  orderId: string
}) {
  const body = `
    <p>Thanks for your purchase, ${escape(ctx.customerName || 'there')}! Your access code for <strong style="color:#F5F0E8;">${escape(ctx.productName)}</strong> is below.</p>
    <div style="background:#0A0A0A;border:2px solid #C9A84C;border-radius:10px;padding:24px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 10px;font-size:11px;color:#9A8F7A;text-transform:uppercase;letter-spacing:1.5px;">Your code</p>
      <div style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#C9A84C;letter-spacing:2px;word-break:break-all;">${escape(ctx.code)}</div>
    </div>
    ${ctx.instructions ? `<p style="margin:12px 0 4px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">How to redeem</p><p style="font-size:13px;color:#9A8F7A;line-height:1.55;white-space:pre-line;">${escape(ctx.instructions)}</p>` : ''}
    <p style="margin:18px 0 0;font-size:12px;color:#9A8F7A;">This code is also saved in your <a href="https://ziptt-prod.vercel.app/orders/digital" style="color:#C9A84C;">My Digital Orders</a>.</p>`
  return {
    subject: `Your zip.tt access code — ${ctx.productName}`,
    html: emailLayout({
      preheader: `Your access code for ${ctx.productName} is ready.`,
      heading: `Your code is ready`,
      body,
      footer: `Need help redeeming? Reply to this email and we\'ll sort it out.`,
    }),
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
