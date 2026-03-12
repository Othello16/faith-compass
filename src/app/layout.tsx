import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Faith Compass — Your Faith. Guided. Not Replaced.',
  description: 'AI-powered faith guidance grounded in Scripture. Find answers, verify truth, connect with real churches nearby. 7 free questions daily.',
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
      <body>{children}</body>
    </html>
  )
}
