'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface LimitGateProps {
  nextAvailable: string | null
}

export default function LimitGate({ nextAvailable }: LimitGateProps) {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (!nextAvailable) return

    const update = () => {
      const diff = new Date(nextAvailable).getTime() - Date.now()
      if (diff <= 0) {
        setCountdown('now')
        return
      }
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setCountdown(`${hours}h ${minutes}m ${seconds}s`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [nextAvailable])

  return (
    <div className="mt-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6 text-center">
      <p className="text-[#D4AF37] font-semibold mb-2">Daily limit reached (3/3)</p>
      <p className="text-white/60 text-sm mb-2">
        You&apos;ve used your 3 free questions today.
      </p>
      {nextAvailable && countdown !== 'now' && (
        <p className="text-white/50 text-sm mb-4">
          Your next question unlocks in: <span className="text-[#D4AF37] font-mono">{countdown}</span>
        </p>
      )}
      {countdown === 'now' && (
        <p className="text-green-400 text-sm mb-4">
          Your next question is available now! Refresh the page.
        </p>
      )}
      <Link href="/pricing" className="inline-block bg-[#D4AF37] text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition">
        Upgrade for Unlimited →
      </Link>
    </div>
  )
}
