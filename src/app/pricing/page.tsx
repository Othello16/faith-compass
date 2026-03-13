'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const tiers = [
  {
    id: 'free',
    name: 'Compass Free',
    price: '$0',
    period: 'forever',
    questions: '3 questions / day',
    description: 'Start your faith journey. No credit card required.',
    cta: 'Start Free',
    ctaHref: '/compass',
    highlight: false,
    stripePlan: null,
  },
  {
    id: 'guided',
    name: 'Compass Guided',
    price: '$3.33',
    period: '/month',
    questions: '100 questions / month',
    description: 'For seekers who go deeper every week.',
    cta: 'Subscribe →',
    ctaHref: null,
    highlight: false,
    stripePlan: 'guided',
  },
  {
    id: 'pro',
    name: 'Compass Pro',
    price: '$7.77',
    period: '/month',
    questions: '500 questions / month',
    description: '777 — divine completion. For daily disciples.',
    cta: 'Go Pro →',
    ctaHref: null,
    highlight: true,
    stripePlan: 'pro',
  },
  {
    id: 'org',
    name: 'Organization',
    price: 'Contact us',
    period: '',
    questions: 'Volume pricing',
    description: 'For churches and ministries. Reach out to discuss.',
    cta: 'Contact Us',
    ctaHref: 'mailto:contact@faithcompass.app',
    highlight: false,
    stripePlan: null,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubscribe = async (plan: string) => {
    setLoading(plan)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        // If not signed in, send to compass to sign in first
        if (res.status === 401) {
          router.push('/compass')
          return
        }
        setError(data.error || 'Could not start checkout. Please try again.')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="text-xl font-bold text-[#D4AF37]">Faith Compass</span>
        </Link>
        <Link href="/compass" className="text-sm text-white/70 hover:text-white transition">
          Open Compass
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple, Honest Pricing</h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            No hidden fees. No tricks. Choose the plan that fits your walk.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl p-6 border flex flex-col relative ${
                tier.highlight
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <h3 className="text-sm font-semibold text-white/60 mb-1">{tier.name}</h3>

              <div className="mb-1">
                <span className={`text-2xl font-bold ${tier.highlight ? 'text-[#D4AF37]' : 'text-white'}`}>
                  {tier.price}
                </span>
                {tier.period && <span className="text-white/40 text-sm ml-1">{tier.period}</span>}
              </div>

              {/* The only feature shown — questions */}
              <div className={`text-sm font-semibold mb-3 ${tier.highlight ? 'text-[#D4AF37]' : 'text-white'}`}>
                {tier.questions}
              </div>

              <p className="text-white/40 text-xs mb-6 flex-1 leading-relaxed">{tier.description}</p>

              {tier.stripePlan ? (
                <button
                  onClick={() => handleSubscribe(tier.stripePlan!)}
                  disabled={loading === tier.stripePlan}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                    tier.highlight
                      ? 'bg-[#D4AF37] text-black hover:bg-yellow-400'
                      : 'bg-[#1E40AF] text-white hover:bg-blue-700'
                  }`}
                >
                  {loading === tier.stripePlan ? 'Loading…' : tier.cta}
                </button>
              ) : (
                <Link
                  href={tier.ctaHref!}
                  className={`block text-center w-full py-3 rounded-xl text-sm font-semibold transition ${
                    tier.highlight
                      ? 'bg-[#D4AF37] text-black hover:bg-yellow-400'
                      : tier.id === 'free'
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'border border-white/20 text-white/70 hover:border-white/40'
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-xs mb-12">
          The $7.77 price is intentional. 777 = divine completion. All glory to God.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-white/50 text-sm">
            Questions reset on a rolling basis — daily for Free, monthly for paid plans.
            <br />
            Cancel anytime. No contracts.
          </p>
        </div>
      </div>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-white/40 text-sm">
        <div className="flex justify-center items-center gap-6 mb-2">
          <span className="text-white/20 text-xs">v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</span>
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
        </div>
        <p className="text-white/20 text-xs">&copy; 2026 Faith Compass. Built with faith and purpose.</p>
      </footer>
    </main>
  )
}
