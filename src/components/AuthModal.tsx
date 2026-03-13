'use client'
import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

type ModalStep = 'choice' | 'signin' | 'signup' | 'verify'

interface AuthModalProps {
  /** Short label shown in the preview line */
  previewLabel?: string
  /** The question or topic text to show as preview */
  pendingText: string
  /** callbackUrl for social OAuth redirects */
  callbackUrl?: string
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({
  previewLabel = 'Your question is ready:',
  pendingText,
  callbackUrl = '/compass',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [step, setStep] = useState<ModalStep>('choice')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = (s: ModalStep) => { setStep(s); setError('') }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Sign in failed'); return }
      onSuccess()
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, marketingOptIn }),
      })
      const data = await res.json()
      if (data.code === 'USER_EXISTS') { setError(data.error); setStep('signin'); return }
      if (!res.ok) { setError(data.error || 'Sign up failed'); return }
      if (data.needsVerification) { setStep('verify') }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Verification failed'); return }
      onSuccess()
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-[#080808] border border-white/15 rounded-2xl w-full max-w-sm p-6 shadow-2xl">

        {/* Preview */}
        <div className="text-center mb-4">
          <span className="text-2xl">🧭</span>
          <p className="text-white/40 text-xs mt-2 leading-relaxed">{previewLabel}</p>
          <p className="text-white/70 text-xs italic mt-1 line-clamp-2 px-2">&ldquo;{pendingText}&rdquo;</p>
        </div>

        {/* STEP: Choice */}
        {step === 'choice' && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-center mb-4">Sign in to continue</h2>

            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <button
              onClick={() => signIn('apple', { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-black border border-white/20 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#111111] transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Continue with Apple
            </button>

            <button
              onClick={() => signIn('twitter', { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-black border border-white/20 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#111111] transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Continue with X
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-[#1A1A1A]" />
              <span className="text-white/30 text-xs">or</span>
              <div className="flex-1 h-px bg-[#1A1A1A]" />
            </div>

            <button
              onClick={() => reset('signin')}
              className="w-full bg-[#C9A84C] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E8C96E] transition"
            >
              Sign in with Email
            </button>
            <button
              onClick={() => reset('signup')}
              className="w-full border border-white/20 text-white/70 py-2.5 rounded-xl text-sm font-medium hover:border-white/40 transition"
            >
              Create Account
            </button>

            {error && <p className="text-yellow-400 text-xs text-center">{error}</p>}

            <div className="text-center pt-1">
              <button onClick={onClose} className="text-white/25 text-xs hover:text-white/40 transition">
                ← Go back
              </button>
            </div>
          </div>
        )}

        {/* STEP: Sign In */}
        {step === 'signin' && (
          <>
            <h2 className="text-base font-bold text-center mb-4">Sign In</h2>
            <form onSubmit={handleSignIn} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                placeholder="Email"
                className="w-full bg-[#111111] border border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Password"
                className="w-full bg-[#111111] border border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]" />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#C9A84C] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E8C96E] transition disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In & Continue'}
              </button>
            </form>
            <div className="mt-3 text-center space-y-2">
              <button onClick={() => reset('signup')} className="text-white/40 text-xs hover:text-white/60 transition">
                Don&apos;t have an account? Sign up free
              </button>
              <div><button onClick={() => reset('choice')} className="text-white/25 text-xs hover:text-white/40 transition">← Other sign-in options</button></div>
            </div>
          </>
        )}

        {/* STEP: Sign Up */}
        {step === 'signup' && (
          <>
            <h2 className="text-base font-bold text-center mb-4">Create Account</h2>
            <form onSubmit={handleSignUp} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                placeholder="Email"
                className="w-full bg-[#111111] border border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Password (8+ chars, uppercase, number)"
                className="w-full bg-[#111111] border border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]" />
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/30 bg-[#1A1A1A] accent-[#C9A84C] shrink-0" />
                <span className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition">
                  I&apos;d like to receive updates, devotional content, and offers from Faith Compass.
                </span>
              </label>
              <p className="text-white/25 text-xs leading-relaxed">
                By creating an account you agree to our{' '}
                <Link href="/terms" className="text-white/40 hover:text-white underline">Terms</Link>
                {' & '}
                <Link href="/privacy" className="text-white/40 hover:text-white underline">Privacy Policy</Link>.
              </p>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#C9A84C] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E8C96E] transition disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Account & Continue'}
              </button>
            </form>
            <div className="mt-3 text-center space-y-2">
              <button onClick={() => reset('signin')} className="text-white/40 text-xs hover:text-white/60 transition">
                Already have an account? Sign in
              </button>
              <div><button onClick={() => reset('choice')} className="text-white/25 text-xs hover:text-white/40 transition">← Other sign-in options</button></div>
            </div>
          </>
        )}

        {/* STEP: Verify Email */}
        {step === 'verify' && (
          <>
            <div className="text-center mb-4">
              <span className="text-3xl">📧</span>
              <h2 className="text-base font-bold mt-2">Check your email</h2>
              <p className="text-white/40 text-xs mt-1">
                We sent a 6-digit code to<br />
                <span className="text-white/70">{email}</span>
              </p>
            </div>
            <form onSubmit={handleVerify} className="space-y-3">
              <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                required autoFocus placeholder="6-digit code"
                className="w-full bg-[#111111] border border-[#1A1A1A] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] text-center text-lg tracking-widest" />
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button type="submit" disabled={loading || code.length < 6}
                className="w-full bg-[#C9A84C] text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E8C96E] transition disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
            <p className="text-center text-white/25 text-xs mt-3">
              Didn&apos;t get it? Check your spam folder.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
