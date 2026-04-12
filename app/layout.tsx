import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { ZipChatWidget } from '@/components/chat/ZipChatWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'zip.tt — Trinidad & Tobago\'s Online Marketplace',
    template: '%s | zip.tt',
  },
  description: 'Shop local. Shop smart. zip.tt is Trinidad & Tobago\'s premier online marketplace — groceries, electronics, fashion, Carnival costumes and more delivered to your door.',
  keywords: ['Trinidad', 'Tobago', 'marketplace', 'shopping', 'online store', 'Caribbean', 'delivery'],
  openGraph: {
    type: 'website',
    locale: 'en_TT',
    siteName: 'zip.tt',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <ZipChatWidget />
        </Providers>
      </body>
    </html>
  )
}
