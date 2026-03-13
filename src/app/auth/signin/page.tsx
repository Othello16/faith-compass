'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sign in failed')
      } else {
        window.location.href = '/compass'
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E40AF] text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-[#D4AF37] hover:text-yellow-400 transition">
                Sign up free
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
