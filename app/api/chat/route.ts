export const dynamic = 'force-dynamic'
import Groq from 'groq-sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'

const GROQ_KEY = process.env.GROQ_API_KEY
const GROQ_ENABLED = !!GROQ_KEY && !GROQ_KEY.startsWith('your-') && !GROQ_KEY.includes('paste') && GROQ_KEY.length > 20
const groq = GROQ_ENABLED ? new Groq({ apiKey: GROQ_KEY }) : null

// ââ In-memory rate limiter: 20 messages / user / hour ââââââââââââââââââââââââ
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

// ââ System prompt âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const SYSTEM_PROMPT = `You are Zip, the AI shopping assistant for zip.tt â Trinidad & Tobago's premier online marketplace.

PERSONALITY:
- Warm, helpful, proudly Trinbagonian ð¹ð¹
- Conversational but professional â knowledgeable friend, not stiff chatbot
- You understand local T&T context deeply

WHAT YOU KNOW ABOUT zip.tt:
- Full marketplace: groceries, electronics, fashion, toys, furniture, Carnival costumes, rum & spirits, services and more
- Vendors include: Don Wvrldwide (streetwear, Port of Spain), D'Best Toys (kids toys, Chaguanas), Elite Home DÃ©cor (furniture & appliances, Arouca), Trini Necessities (gifts & lifestyle), iWorld TT (authorised Apple reseller)
- Currency: TTD (Trinidad & Tobago Dollars)
- Payments: WiPay (card/Linx), Cash on Delivery, Online Banking
- Free delivery on orders over $500 TTD
- Delivery: 1â2 days Port of Spain/West, 2â3 days Central & South
- Return window: 7 days for unopened items; damaged/wrong items fully covered
- Commission: vendors pay 10%, weekly payouts every Friday
- 2,800+ active products listed

LOCAL KNOWLEDGE:
- You know Trinidadian expressions and Caribbean culture
- Carnival season (JanâFeb) is busiest â advise customers to order early
- Cash on delivery is very popular and always available
- Some rural areas have limited courier access; contact support@zip.tt for remote locations
- Currency is TTD; never quote prices in USD unless asked

WHAT YOU HELP WITH:
For Shoppers:
- Find products by name, category, or budget
- Recommend products from our catalog
- Explain delivery times to specific T&T regions
- Help with order tracking and status (tell them to check My Account â Orders)
- Walk through return/refund requests
- Answer questions about payments and delivery

For Vendors:
- Guide through listing creation step by step
- Pricing strategy and product photography tips
- Explain fees, payout schedules, commission structure
- Help with inventory management and order fulfillment

BOUNDARIES:
- Never share other users' personal info
- Never promise exact delivery dates â give estimates with caveats
- For fraud, unresolved disputes, or account issues: support@zip.tt
- Cannot process payments directly
- Keep responses concise â under 150 words unless a detailed guide is requested

TONE EXAMPLES:
â "Your order is being processed."
â "Your order is on its way! The vendor confirmed it â expect it in 2â3 business days depending on your area. ð"
â "Please refer to our return policy."
â "No worries! If the item arrived damaged or isn't what was described, go to My Orders â [Order] â Request Return and I'll walk you through it."

Always be solution-oriented. If you cannot fix it, tell the user exactly what happens next.`

// ââ Free built-in fallback when no Groq key âââââââââââââââââââââââââââââââââââ
interface FallbackRule { patterns: RegExp[]; response: string | ((m: string) => string) }

const FALLBACK_RULES: FallbackRule[] = [
  {
    patterns: [/track|where.*order|order.*status|delivery.*status/i],
    response: `To track your order go to **My Account â Orders** ð¦\n\nStatus meanings:\nâ¢ **Pending** â vendor is confirming\nâ¢ **Processing** â being prepared\nâ¢ **Shipped** â on its way!\nâ¢ **Delivered** â enjoy! ð\n\nShare your order number if you need more help.`,
  },
  {
    patterns: [/return|refund|send.*back|wrong.*item|damaged/i],
    response: `Our return policy:\n\nâ¢ **7 days** from delivery to request a return\nâ¢ Item must be unused and in original packaging\nâ¢ Damaged/wrong items â vendor covers return shipping\nâ¢ Refunds in **5â7 business days**\n\nGo to **My Orders â [Order] â Request Return** to start.`,
  },
  {
    patterns: [/pay|payment|cash.*delivery|linx|online.*bank/i],
    response: `zip.tt accepts:\n\nâ¢ ðµ **Cash on Delivery** â pay when you receive\nâ¢ ð³ **Linx/WiPay** â local debit card\nâ¢ ð¦ **Online Banking** â direct bank transfer\n\nAll payments are secure and buyer-protected. ð`,
  },
  {
    patterns: [/deliver|shipping|how.*long|when.*arrive|san fernando|chaguanas|arima/i],
    response: `Delivery across Trinidad:\n\nâ¢ ð **Port of Spain & West** â 1â2 business days\nâ¢ ð **Central** (Chaguanas, Couva) â 2â3 days\nâ¢ ð **South** (San Fernando, La Romaine) â 2â3 days\n\nâ¨ **Free delivery** on orders over TTD $500!`,
  },
  {
    patterns: [/carnival|mas|costume|soca|fete/i],
    response: `Carnival season on zip.tt! ð­ð¹ð¹\n\nð **[Carnival & Mas](/products?category=carnival-mas)**\n\nCostumes, accessories, and everything for the road. Order early â Carnival stock moves fast!`,
  },
  {
    patterns: [/iphone|ipad|macbook|apple|iworld/i],
    response: `For Apple products, check out **iWorld TT** â the only authorised Apple reseller in T&T! ð±\n\nð **[Shop Apple products](/products?category=electronics)**\n\niPhones, iPads, MacBooks, AirPods, and accessories â all genuine.`,
  },
  {
    patterns: [/electronics|phone|samsung|laptop|android/i],
    response: `Browse our electronics section! ð±ð»\n\nð **[Shop Electronics](/products?category=electronics)**\n\nWe carry phones, laptops, tablets, and accessories from trusted vendors across T&T.`,
  },
  {
    patterns: [/toy|kids|children|lego|game/i],
    response: `Looking for toys and kids' products? ð§¸\n\nð **[Shop Toys & Games](/products?category=toys-games-kids)**\n\nCheck out **D'Best Toys** in Chaguanas â 1,000+ toys for all ages!`,
  },
  {
    patterns: [/find|search|looking for|do you have|sell|any.*in stock/i],
    response: (msg: string) => {
      const q = msg.replace(/find|search|looking for|do you have|sell|any|in stock/gi, '').trim()
      return `I'll help you find that! ð\n\nð **[Browse products](/products${q ? `?q=${encodeURIComponent(q)}` : ''})** â we have 2,800+ items from local T&T vendors.\n\nOr browse by category:\nâ¢ ð± [Electronics](/products?category=electronics)\nâ¢ ð [Fashion](/products?category=fashion-clothing)\nâ¢ ð­ [Carnival](/products?category=carnival-mas)\nâ¢ ð  [Home & Garden](/products?category=home-garden)\nâ¢ ð§¸ [Toys](/products?category=toys-games-kids)`
    },
  },
  {
    patterns: [/vendor|sell|open.*store|become.*vendor|commission|payout/i],
    response: `Want to sell on zip.tt? ðª\n\nð **[Apply now](/vendor/register)** â free to join!\n\nâ¢ â Free to list products\nâ¢ ð° 10% commission on sales only\nâ¢ ð Weekly payouts every Friday`,
  },
  {
    patterns: [/hello|hi\b|hey|good morning|good afternoon|help me|what can/i],
    response: `Hey! I'm Zip, your zip.tt shopping assistant ð¹ð¹\n\nI can help you:\nâ¢ ð **Find products** across T&T\nâ¢ ð¦ **Track orders** and check delivery\nâ¢ ð **Returns** and refunds\nâ¢ ðª **Vendor support** and tips\n\nWhat can I help you with today?`,
  },
]

function getFallbackReply(msg: string): string {
  for (const rule of FALLBACK_RULES) {
    if (rule.patterns.some((p) => p.test(msg))) {
      return typeof rule.response === 'function' ? rule.response(msg) : rule.response
    }
  }
  return `Thanks for reaching out! ð\n\nI'm Zip, your zip.tt shopping assistant. Try:\n\nâ¢ ð **[Browse products](/products)** â 2,800+ items from local vendors\nâ¢ ð¦ Track orders in **My Account**\nâ¢ ð¬ Ask me about delivery, returns, or payments\n\nWhat would you like to know?`
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

// ââ Main handler ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

    // ââ Path A: Groq AI âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    if (groq) {
      let systemExtra = ''
      if (session?.user) {
        systemExtra = `\nCurrent user: ${session.user.name ?? 'Customer'}`
        if (mode === 'vendor') systemExtra += ' (Vendor â give business-focused advice)'
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

    // ââ Path B: Free built-in smart replies âââââââââââââââââââââââââââââââââââ
    const reply = getFallbackReply(lastUserMsg)
    return streamText(reply)
  } catch (error) {
    console.error('Chat API error:', error)
    return streamText("Sorry, I'm having a technical hiccup! Try again or email support@zip.tt ð")
  }
}
