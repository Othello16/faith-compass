import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import CookieConsent from '@/components/CookieConsent'
import FloatingCompass from '@/components/FloatingCompass'

export const metadata: Metadata = {
  title: 'Faith Compass — Your Faith. Guided. Not Replaced.',
  description: 'AI-powered faith guidance grounded in Scripture. Find answers, verify truth, connect with real churches nearby. 3 free questions daily.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  openGraph: {
    title: 'Faith Compass',
    description: 'AI-powered faith guidance grounded in Scripture.',
    url: 'https://faithcompass.app',
    siteName: 'Faith Compass',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
        <FloatingCompass />
        <CookieConsent />
      </body>
    </html>
  )
}
