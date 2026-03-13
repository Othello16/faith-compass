'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('fc-cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('fc-cookie-consent', 'accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('fc-cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-6 py-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-[#374151] text-sm flex-1">
          We use cookies for authentication and to remember your preferences.
          We do not use tracking or advertising cookies.{' '}
          <Link href="/privacy" className="text-[#C9A84C] hover:underline transition">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-[#374151] hover:text-[#0A0A0A] border border-gray-200 rounded-lg transition"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm btn-gold rounded-lg"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
