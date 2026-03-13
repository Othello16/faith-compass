'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setLoading(true)
    // Cognito handles sign-up via hosted UI
    await signIn('cognito', { callbackUrl: '/compass' })
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🧭</span>
            <span className="text-2xl font-bold"><span className="text-white">Faith</span> <span className="text-[#C9A84C]">Compass</span></span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p className="text-white/50 text-sm">Start your faith journey with Faith Compass</p>
        </div>

        <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8">
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="text-[#C9A84C]">✓</span> 3 free questions every 24 hours
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="text-[#C9A84C]">✓</span> Scripture-anchored AI guidance
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="text-[#C9A84C]">✓</span> Church finder access
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="text-[#C9A84C]">✓</span> No credit card required
            </div>
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-[#C9A84C] text-black py-3 rounded-xl text-sm font-semibold hover:bg-[#E8C96E] transition disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Create Account'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-[#C9A84C] hover:text-[#E8C96E] transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-white/30 text-xs">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-[#C9A84C]/60 hover:text-[#C9A84C]">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#C9A84C]/60 hover:text-[#C9A84C]">Privacy Policy</Link>
        </p>
      </div>
    </main>
  )
}
