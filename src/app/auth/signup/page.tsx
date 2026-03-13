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
    <main className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🧭</span>
            <span className="text-2xl font-bold text-[#D4AF37]">Faith Compass</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p className="text-white/50 text-sm">Start your faith journey with Faith Compass</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="text-green-400">✓</span> 3 free questions every 24 hours
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="text-green-400">✓</span> Scripture-anchored AI guidance
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="text-green-400">✓</span> Church finder access
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="text-green-400">✓</span> No credit card required
            </div>
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-[#D4AF37] text-black py-3 rounded-xl text-sm font-semibold hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Create Account'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-[#D4AF37] hover:text-yellow-400 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-white/30 text-xs">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-[#D4AF37]/60 hover:text-[#D4AF37]">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#D4AF37]/60 hover:text-[#D4AF37]">Privacy Policy</Link>
        </p>
      </div>
    </main>
  )
}
