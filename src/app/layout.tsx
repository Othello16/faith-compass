import type { Metadata, Viewport } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import CookieConsent from '@/components/CookieConsent'
import FloatingCompass from '@/components/FloatingCompass'
import InstallPrompt from '@/components/InstallPrompt'
import Footer from '@/components/Footer'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0F172A',
}

export const metadata: Metadata = {
  title: 'Faith Compass — Ask the Compass. Not the crowd.',
  description: 'The first voice assistant built on the Word of God. Scripture-verified answers, Church Finder, Topical Bible. 3 free questions daily.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Faith Compass',
  },
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-167x167.png', sizes: '167x167', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Faith Compass — Ask the Compass. Not the crowd.',
    description: 'The first voice assistant built on the Word of God. Scripture-verified answers grounded in the Word.',
    url: 'https://faithcompass.app',
    siteName: 'Faith Compass',
    type: 'website',
    images: [{ url: '/icon-512x512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: 'Faith Compass',
    description: 'Ask the Compass. Not the crowd.',
    images: ['/icon-512x512.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA iOS meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Faith Compass" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Faith Compass" />
        {/* Splash screen background color for iOS */}
        <meta name="msapplication-TileColor" content="#0F172A" />
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
      </head>
      <body>
        <SessionProvider>
          {children}
          <Footer />
        </SessionProvider>
        <FloatingCompass />
        <InstallPrompt />
        <CookieConsent />
      </body>
    </html>
  )
}
