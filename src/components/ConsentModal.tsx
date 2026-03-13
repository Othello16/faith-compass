'use client'
import { useState } from 'react'
import Link from 'next/link'

interface ConsentModalProps {
  onAccept: () => void
  onClose: () => void
}

export default function ConsentModal({ onAccept, onClose }: ConsentModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canAccept = termsAccepted && privacyAccepted

  const handleAccept = async () => {
    if (!canAccept) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termsAccepted, privacyAccepted, marketingOptIn }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save consent')
        return
      }
      onAccept()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-[#080808] border border-white/15 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="text-center mb-5">
          <span className="text-2xl">🧭</span>
          <h2 className="text-base font-bold mt-2">Welcome to Faith Compass</h2>
          <p className="text-white/40 text-xs mt-1">Please review and accept to continue</p>
        </div>

        <div className="space-y-3 mb-5">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/30 bg-[#1A1A1A] accent-[#C9A84C] shrink-0"
            />
            <span className="text-xs text-white/60 leading-relaxed group-hover:text-white/80 transition">
              I accept the{' '}
              <Link href="/terms" target="_blank" className="text-[#C9A84C] underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" target="_blank" className="text-[#C9A84C] underline">Privacy Policy</Link>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={e => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/30 bg-[#1A1A1A] accent-[#C9A84C] shrink-0"
            />
            <span className="text-xs text-white/60 leading-relaxed group-hover:text-white/80 transition">
              I consent to Faith Compass using my data as described in the Privacy Policy <span className="text-white/30">(required)</span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={e => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/30 bg-[#1A1A1A] accent-[#C9A84C] shrink-0"
            />
            <span className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition">
              I&apos;d like to receive devotional content and updates <span className="text-white/20">(optional)</span>
            </span>
          </label>
        </div>

        {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

        <button
          onClick={handleAccept}
          disabled={!canAccept || loading}
          className="w-full bg-[#C9A84C] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E8C96E] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Accept & Continue'}
        </button>

        <div className="text-center mt-3">
          <button onClick={onClose} className="text-white/25 text-xs hover:text-white/40 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
