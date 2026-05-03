import type { Metadata } from 'next'
import { Inter, Noto_Color_Emoji } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { ZipChatWidget } from '@/components/chat/ZipChatWidget'
import { validateEnv } from '@/lib/env'

// Fail loudly at server boot if a required env var is missing rather
// than letting Prisma 500 on the first DB-touching request.
validateEnv()

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoEmoji = Noto_Color_Emoji({
  weight: '400',
  subsets: ['emoji'],
  variable: '--font-emoji',
  display: 'swap',
})

// Default metadata applied to every page that doesn't override
// generateMetadata(). Pages that DO override (product detail, store
// page) get richer OG tags — the values here are the fallback that
// ships when a link to "/" is shared, e.g. on WhatsApp.
const SITE_URL = 'https://ziptt-prod.vercel.app'
const DEFAULT_TITLE = "zip.tt — Trinidad & Tobago's #1 Online Marketplace"
const DEFAULT_DESC =
  "Shop local. Shop smart. zip.tt is Trinidad & Tobago's online marketplace — groceries, electronics, fashion, Carnival costumes, rum & spirits delivered to your door."
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: '%s | zip.tt' },
  description: DEFAULT_DESC,
  keywords: ['Trinidad', 'Tobago', 'marketplace', 'shopping', 'online store', 'Caribbean', 'delivery', 'carnival', 'rum'],
  openGraph: {
    type: 'website',
    locale: 'en_TT',
    siteName: 'zip.tt',
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'zip.tt' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoEmoji.variable}`} style={{ fontFamily: "var(--font-inter), 'Noto Color Emoji', sans-serif" }}>
        <Providers>
          {children}
          <ZipChatWidget />
        </Providers>
      </body>
    </html>
  )
}
