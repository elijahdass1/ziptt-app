import Groq from 'groq-sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'

const GROQ_KEY = process.env.GROQ_API_KEY
const GROQ_ENABLED = !!GROQ_KEY && !GROQ_KEY.startsWith('your-') && !GROQ_KEY.includes('paste') && GROQ_KEY.length > 20
const groq = GROQ_ENABLED ? new Groq({ apiKey: GROQ_KEY }) : null

// ── In-memory rate limiter: 20 messages / user / hour ────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(id: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(id)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(id, { count: 1, resetAt: now + 3_600_000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Zip, the AI shopping assistant for zip.tt — Trinidad & Tobago's premier online marketplace.

PERSONALITY:
- Warm, helpful, proudly Trinbagonian 🇹🇹
- Conversational but professional — knowledgeable friend, not stiff chatbot
- You understand local T&T context deeply

WHAT YOU KNOW ABOUT zip.tt:
- Full marketplace: groceries, electronics, fashion, toys, furniture, Carnival costumes, rum & spirits, services and more
- Vendors include: Don Wvrldwide (streetwear, Port of Spain), D'Best Toys (kids toys, Chaguanas), Elite Home Décor (furniture & appliances, Arouca), Trini Necessities (gifts & lifestyle), iWorld TT (authorised Apple reseller)
- Currency: TTD (Trinidad & Tobago Dollars)
- Payments: WiPay (card/Linx), Cash on Delivery, Online Banking
- Free delivery on orders over $500 TTD
- Delivery: 1–2 days Port of Spain/West, 2–3 days Central & South
- Return window: 7 days for unopened items; damaged/wrong items fully covered
- Commission: vendors pay 10%, weekly payouts every Friday
- 2,800+ active products listed

LOCAL KNOWLEDGE:
- You know Trinidadian expressions and Caribbean culture
- Carnival season (Jan–Feb) is busiest — advise customers to order early
- Cash on delivery is very popular and always available
- Some rural areas have limited courier access; contact support@zip.tt for remote locations
- Currency is TTD; never quote prices in USD unless asked

WHAT YOU HELP WITH:
For Shoppers:
- Find products by name, category, or budget
- Recommend products from our catalog
- Explain delivery times to specific T&T regions
- Help with order tracking and status (tell them to check My Account → Orders)
- Walk through return/refund requests
- Answer questions about payments and delivery

For Vendors:
- Guide through listing creation step by step
- Pricing strategy and product photography tips
- Explain fees, payout schedules, commission structure
- Help with inventory management and order fulfillment

BOUNDARIES:
- Never share other users' personal info
- Never promise exact delivery dates — give estimates with caveats
- For fraud, unresolved disputes, or account issues: support@zip.tt
- Cannot process payments directly
- Keep responses concise — under 150 words unless a detailed guide is requested

TONE EXAMPLES:
❌ "Your order is being processed."
✅ "Your order is on its way! The vendor confirmed it — expect it in 2–3 business days depending on your area. 🚚"
❌ "Please refer to our return policy."
✅ "No worries! If the item arrived damaged or isn't what was described, go to My Orders → [Order] → Request Return and I'll walk you through it."

Always be solution-oriented. If you cannot fix it, tell the user exactly what happens next.`

// ── Free built-in fallback when no Groq key ───────────────────────────────────
interface FallbackRule { patterns: RegExp[]; response: string | ((m: string) => string) }

const FALLBACK_RULES: FallbackRule[] = [
  {
    patterns: [/track|where.*order|order.*status|delivery.*status/i],
    response: `To track your order go to **My Account → Orders** 📦\n\nStatus meanings:\n• **Pending** — vendor is confirming\n• **Processing** — being prepared\n• **Shipped** — on its way!\n• **Delivered** — enjoy! 🎉\n\nShare your order number if you need more help.`,
  },
  {
    patterns: [/return|refund|send.*back|wrong.*item|damaged/i],
    response: `Our return policy:\n\n• **7 days** from delivery to request a return\n• Item must be unused and in original packaging\n• Damaged/wrong items — vendor covers return shipping\n• Refunds in **5–7 business days**\n\nGo to **My Orders → [Order] → Request Return** to start.`,
  },
  {
    patterns: [/pay|payment|cash.*delivery|linx|online.*bank/i],
    response: `zip.tt accepts:\n\n• 💵 **Cash on Delivery** — pay when you receive\n• 💳 **Linx/WiPay** — local debit card\n• 🏦 **Online Banking** — direct bank transfer\n\nAll payments are secure and buyer-protected. 🔒`,
  },
  {
    patterns: [/deliver|shipping|how.*long|when.*arrive|san fernando|chaguanas|arima/i],
    response: `Delivery across Trinidad:\n\n• 📍 **Port of Spain & West** — 1–2 business days\n• 📍 **Central** (Chaguanas, Couva) — 2–3 days\n• 📍 **South** (San Fernando, La Romaine) — 2–3 days\n\n✨ **Free delivery** on orders over TTD $500!`,
  },
  {
    patterns: [/carnival|mas|costume|soca|fete/i],
    response: `Carnival season on zip.tt! 🎭🇹🇹\n\n👉 **[Carnival & Mas](/products?category=carnival-mas)**\n\nCostumes, accessories, and everything for the road. Order early — Carnival stock moves fast!`,
  },
  {
    patterns: [/iphone|ipad|macbook|apple|iworld/i],
    response: `For Apple products, check out **iWorld TT** — the only authorised Apple reseller in T&T! 📱\n\n👉 **[Shop Apple products](/products?category=electronics)**\n\niPhones, iPads, MacBooks, AirPods, and accessories — all genuine.`,
  },
  {
    patterns: [/electronics|phone|samsung|laptop|android/i],
    response: `Browse our electronics section! 📱💻\n\n👉 **[Shop Electronics](/products?category=electronics)**\n\nWe carry phones, laptops, tablets, and accessories from trusted vendors across T&T.`,
  },
  {
    patterns: [/toy|kids|children|lego|game/i],
    response: `Looking for toys and kids' products? 🧸\n\n👉 **[Shop Toys & Games](/products?category=toys-games-kids)**\n\nCheck out **D'Best Toys** in Chaguanas — 1,000+ toys for all ages!`,
  },
  {
    patterns: [/find|search|looking for|do you have|sell|any.*in stock/i],
    response: (msg: string) => {
      const q = msg.replace(/find|search|looking for|do you have|sell|any|in stock/gi, '').trim()
      return `I'll help you find that! 🔍\n\n👉 **[Browse products](/products${q ? `?q=${encodeURIComponent(q)}` : ''})** — we have 2,800+ items from local T&T vendors.\n\nOr browse by category:\n• 📱 [Electronics](/products?category=electronics)\n• 👗 [Fashion](/products?category=fashion-clothing)\n• 🎭 [Carnival](/products?category=carnival-mas)\n• 🏠 [Home & Garden](/products?category=home-garden)\n• 🧸 [Toys](/products?category=toys-games-kids)`
    },
  },
  {
    patterns: [/vendor|sell|open.*store|become.*vendor|commission|payout/i],
    response: `Want to sell on zip.tt? 🏪\n\n👉 **[Apply now](/vendor/register)** — free to join!\n\n• ✅ Free to list products\n• 💰 10% commission on sales only\n• 📅 Weekly payouts every Friday`,
  },
  {
    patterns: [/hello|hi\b|hey|good morning|good afternoon|help me|what can/i],
    response: `Hey! I'm Zip, your zip.tt shopping assistant 🇹🇹\n\nI can help you:\n• 🔍 **Find products** across T&T\n• 📦 **Track orders** and check delivery\n• 🔄 **Returns** and refunds\n• 🏪 **Vendor support** and tips\n\nWhat can I help you with today?`,
  },
]

function getFallbackReply(msg: string): string {
  for (const rule of FALLBACK_RULES) {
    if (rule.patterns.some((p) => p.test(msg))) {
      return typeof rule.response === 'function' ? rule.response(msg) : rule.response
    }
  }
  return `Thanks for reaching out! 😊\n\nI'm Zip, your zip.tt shopping assistant. Try:\n\n• 🔍 **[Browse products](/products)** — 2,800+ items from local vendors\n• 📦 Track orders in **My Account**\n• 💬 Ask me about delivery, returns, or payments\n\nWhat would you like to know?`
}

function streamText(text: string): Response {
  const encoder = new TextEncoder()
  const words = text.split(' ')
  const readable = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const chunk = i === 0 ? words[i] : ' ' + words[i]
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
        await new Promise((r) => setTimeout(r, 16))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { messages, mode = 'customer' } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[]
      mode?: 'customer' | 'vendor'
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Invalid messages' }, { status: 400 })
    }

    const lastUserMsg = messages.filter((m) => m.role === 'user').at(-1)?.content ?? ''

    if (lastUserMsg.length > 500) {
      return Response.json({ error: 'Message too long (max 500 characters).' }, { status: 400 })
    }

    // Rate limiting
    const identifier =
      session?.user?.id ??
      req.headers.get('x-forwarded-for') ??
      req.headers.get('x-real-ip') ??
      'anonymous'

    if (!checkRateLimit(identifier)) {
      return Response.json({ error: 'Chat limit reached. Please try again in an hour.' }, { status: 429 })
    }

    // ── Path A: Groq AI ───────────────────────────────────────────────────────
    if (groq) {
      let systemExtra = ''
      if (session?.user) {
        systemExtra = `\nCurrent user: ${session.user.name ?? 'Customer'}`
        if (mode === 'vendor') systemExtra += ' (Vendor — give business-focused advice)'
      }

      const recentHistory = messages
        .slice(-8)
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 500) }))

      const stream = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + systemExtra },
          ...recentHistory,
        ],
        max_tokens: 400,
        temperature: 0.7,
        stream: true,
      })

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content ?? ''
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          } catch (err) {
            console.error('Groq stream error:', err)
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      })
    }

    // ── Path B: Free built-in smart replies ───────────────────────────────────
    const reply = getFallbackReply(lastUserMsg)
    return streamText(reply)
  } catch (error) {
    console.error('Chat API error:', error)
    return streamText("Sorry, I'm having a technical hiccup! Try again or email support@zip.tt 🙏")
  }
}
