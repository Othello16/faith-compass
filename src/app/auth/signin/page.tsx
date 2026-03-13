'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
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
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-white/50 text-sm">Sign in to access your faith journey</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-[#1E40AF] text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Sign in with Email'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-[#D4AF37] hover:text-yellow-400 transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-white/30 text-xs hover:text-white/50 transition">
            Continue without account (3 free questions/day)
          </Link>
        </div>
      </div>
    </main>
  )
}
