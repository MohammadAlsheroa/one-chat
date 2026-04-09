import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import NextTopLoader from 'nextjs-toploader'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'OneChat — Public AI Conversations',
  description: 'Chat with AI. All conversations are public and anonymous.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans bg-stone-50 text-stone-900 antialiased">
        <NextTopLoader color="#059669" height={2} showSpinner={false} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
