'use client'
import { useState, useEffect } from 'react'

interface LimitGateProps {
  nextAvailable: string | null
  plan: 'free' | 'guided' | 'pro'
  used: number
  limit: number
}

export default function LimitGate({ nextAvailable, plan, used, limit }: LimitGateProps) {
  const [countdown, setCountdown] = useState('')
  const [upgrading, setUpgrading] = useState<'guided' | 'pro' | null>(null)

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

  const handleUpgrade = async (targetPlan: 'guided' | 'pro') => {
    setUpgrading(targetPlan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      })
      const data = await res.json()
      if (res.status === 401) {
        window.location.href = '/pricing'
        return
      }
      if (data.url) window.location.href = data.url
      else setUpgrading(null)
    } catch {
      setUpgrading(null)
    }
  }

  const showGuided = plan === 'free'
  const showPro = plan === 'free' || plan === 'guided'
  const showUpgrade = showGuided || showPro

  return (
    <div className="mt-6 bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center shadow-sm">
      <p className="text-[#0A0A0A] font-semibold text-lg mb-1">You&apos;ve reached your limit</p>
      <p className="text-[#374151] text-sm mb-4">
        {used} of {limit} questions used
      </p>

      {showUpgrade && (
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 mb-4">
          <p className="text-[#0A0A0A] font-semibold text-sm mb-3 flex items-center justify-center gap-1.5">
            <span className="text-[#C9A84C]">&#10024;</span> Upgrade to get more questions
          </p>
          <div className="space-y-2">
            {showGuided && (
              <div className="flex items-center justify-between gap-3 bg-white border border-[#E5E7EB] rounded-lg px-4 py-3">
                <div className="text-left">
                  <p className="text-[#0A0A0A] text-sm font-medium">Compass Guided</p>
                  <p className="text-[#6B7280] text-xs">100 questions/mo</p>
                </div>
                <button
                  onClick={() => handleUpgrade('guided')}
                  disabled={upgrading !== null}
                  className="btn-gold px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                >
                  {upgrading === 'guided' ? 'Loading...' : 'Subscribe $3.33/mo'}
                </button>
              </div>
            )}
            {showPro && (
              <div className="flex items-center justify-between gap-3 bg-white border border-[#E5E7EB] rounded-lg px-4 py-3">
                <div className="text-left">
                  <p className="text-[#0A0A0A] text-sm font-medium">Compass Pro</p>
                  <p className="text-[#6B7280] text-xs">500 questions/mo</p>
                </div>
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={upgrading !== null}
                  className="btn-gold px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                >
                  {upgrading === 'pro' ? 'Loading...' : 'Go Pro $7.77/mo'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {nextAvailable && countdown !== 'now' && (
        <p className="text-[#374151] text-sm">
          {plan === 'pro' ? 'Next question available in:' : 'Next free question in:'}{' '}
          <span className="gold-text font-mono font-bold">{countdown}</span>
        </p>
      )}
      {countdown === 'now' && (
        <p className="text-green-600 text-sm">
          Your next question is available now! Refresh the page.
        </p>
      )}
    </div>
  )
}
