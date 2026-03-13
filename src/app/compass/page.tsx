'use client'
import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Header from '@/components/Header'
import LimitGate from '@/components/LimitGate'
import ConsentModal from '@/components/ConsentModal'
import CompassVoicePlayer from '@/components/CompassVoicePlayer'
import { bookNameToSlug } from '@/lib/bible'

interface BibleVerse {
  id: string
  book: string
  chapter: number
  verse: number
  text: string
  hash: string
  reference: string
  verified: boolean
}

type ModalStep = 'choice' | 'signin' | 'signup' | 'verify'

// Web Speech API types
interface ISpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number
  start(): void; stop(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: Event) => void) | null
  onend: ((e: Event) => void) | null
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

// ── Auth Gate Modal ─────────────────────────────────────────────────────────
function AuthModal({
  pendingQuestion,
  onClose,
  onSuccess,
}: {
  pendingQuestion: string
  onClose: () => void
  onSuccess: () => void
}) {
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
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl">

        {/* Question preview */}
        <div className="text-center mb-4">
          <span className="text-2xl">🧭</span>
          <p className="text-[#9CA3AF] text-xs mt-2 leading-relaxed">Your question is ready:</p>
          <p className="text-[#374151] text-xs italic mt-1 line-clamp-2 px-2">&ldquo;{pendingQuestion}&rdquo;</p>
        </div>

        {/* STEP: Choice */}
        {step === 'choice' && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-center mb-4 text-[#0A0A0A]">Sign in to get your answer</h2>

            <button
              onClick={() => signIn('google', { callbackUrl: '/compass' })}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <button
              onClick={() => signIn('apple', { callbackUrl: '/compass' })}
              className="w-full flex items-center justify-center gap-3 bg-[#080808] border border-gray-200 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#111111] transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Continue with Apple
            </button>

            <button
              onClick={() => signIn('twitter', { callbackUrl: '/compass' })}
              className="w-full flex items-center justify-center gap-3 bg-[#080808] border border-gray-200 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#111111] transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Continue with X
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[#9CA3AF] text-xs">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={() => reset('signin')}
              className="w-full btn-gold py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Sign in with Email
            </button>
            <button
              onClick={() => reset('signup')}
              className="w-full border border-gray-200 text-[#374151] py-2.5 rounded-xl text-sm font-medium hover:border-gray-300 transition"
            >
              Create Account
            </button>

            {error && <p className="text-yellow-400 text-xs text-center">{error}</p>}

            <div className="text-center pt-1">
              <button onClick={onClose} className="text-[#9CA3AF] text-xs hover:text-[#374151] transition">
                ← Back to home
              </button>
            </div>
          </div>
        )}

        {/* STEP: Sign In */}
        {step === 'signin' && (
          <>
            <h2 className="text-base font-bold text-center mb-4 text-[#0A0A0A]">Sign In</h2>
            <form onSubmit={handleSignIn} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                placeholder="Email"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Password"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]" />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full btn-gold py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In & Get My Answer'}
              </button>
            </form>
            <div className="mt-3 text-center space-y-2">
              <button onClick={() => reset('signup')} className="text-[#9CA3AF] text-xs hover:text-[#374151] transition">
                Don&apos;t have an account? Sign up free
              </button>
              <div><button onClick={() => reset('choice')} className="text-[#9CA3AF] text-xs hover:text-[#374151] transition">← Other sign-in options</button></div>
            </div>
          </>
        )}

        {/* STEP: Sign Up */}
        {step === 'signup' && (
          <>
            <h2 className="text-base font-bold text-center mb-4 text-[#0A0A0A]">Create Account</h2>
            <form onSubmit={handleSignUp} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                placeholder="Email"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Password (8+ chars, uppercase, number)"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]" />

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={e => setMarketingOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 bg-white accent-[#C9A84C] shrink-0"
                />
                <span className="text-xs text-[#9CA3AF] leading-relaxed group-hover:text-[#374151] transition">
                  I&apos;d like to receive updates, devotional content, and offers from Faith Compass. You can unsubscribe at any time.
                </span>
              </label>

              <p className="text-[#9CA3AF] text-xs leading-relaxed">
                By creating an account you agree to our{' '}
                <Link href="/terms" className="text-[#374151] hover:text-[#0A0A0A] underline">Terms</Link>
                {' & '}
                <Link href="/privacy" className="text-[#374151] hover:text-[#0A0A0A] underline">Privacy Policy</Link>.
              </p>

              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full btn-gold py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Account & Ask'}
              </button>
            </form>
            <div className="mt-3 text-center space-y-2">
              <button onClick={() => reset('signin')} className="text-[#9CA3AF] text-xs hover:text-[#374151] transition">
                Already have an account? Sign in
              </button>
              <div><button onClick={() => reset('choice')} className="text-[#9CA3AF] text-xs hover:text-[#374151] transition">← Other sign-in options</button></div>
            </div>
          </>
        )}

        {/* STEP: Verify Email */}
        {step === 'verify' && (
          <>
            <div className="text-center mb-4">
              <span className="text-3xl">📧</span>
              <h2 className="text-base font-bold mt-2 text-[#0A0A0A]">Check your email</h2>
              <p className="text-[#9CA3AF] text-xs mt-1">
                We sent a 6-digit code to<br />
                <span className="text-[#0A0A0A]">{email}</span>
              </p>
            </div>
            <form onSubmit={handleVerify} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                required autoFocus
                placeholder="6-digit code"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-center text-lg tracking-widest"
              />
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button type="submit" disabled={loading || code.length < 6}
                className="w-full btn-gold py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Get My Answer'}
              </button>
            </form>
            <p className="text-center text-[#9CA3AF] text-xs mt-3">
              Didn&apos;t get it? Check your spam folder.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function CompassPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CompassContent />
    </Suspense>
  )
}

function CompassContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)
  // Stable refs to avoid stale closures in speech recognition callbacks
  const sessionRef = useRef(session)
  useEffect(() => { sessionRef.current = session }, [session])

  // Fix 5: Show success banner after upgrade
  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      setShowUpgradeBanner(true)
      setTimeout(() => setShowUpgradeBanner(false), 10000)
    }
  }, [searchParams])

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [used, setUsed] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const [nextAvailable, setNextAvailable] = useState<string | null>(null)
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const [showAuth, setShowAuth] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const pendingQuestion = useRef('')
  const hasAutoSubmitted = useRef(false)
  const LIMIT = 3

  // Voice state (speech recognition)
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  // TTS voice preference
  const [savedVoice, setSavedVoice] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('fc_voice_id') || 'onyx'
      : 'onyx'
  )

  // ── Consent check helper ──────────────────────────────────────────────────
  const checkConsentAndSubmit = useCallback(async (q: string) => {
    try {
      const res = await fetch('/api/auth/consent')
      const data = await res.json()
      if (data.hasConsented) {
        submitQuestionRef.current(q)
      } else {
        pendingQuestion.current = q
        setShowConsent(true)
      }
    } catch {
      // If consent check fails, try submitting anyway (server will enforce)
      submitQuestionRef.current(q)
    }
  }, [])

  // ── Submit question ───────────────────────────────────────────────────────
  const submitQuestion = useCallback(async (q: string) => {
    if (!q.trim() || loading || limitReached) return
    setLoading(true)
    setShowAuth(false)
    setShowConsent(false)
    setAnswer('')
    setVerses([])
    try {
      const [compassRes, bibleRes] = await Promise.all([
        fetch('/api/compass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q }),
        }),
        fetch('/api/bible/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        }).catch(() => null),
      ])

      const compassData = await compassRes.json()

      if (compassRes.status === 403 && compassData.error === 'consent_required') {
        pendingQuestion.current = q
        setShowConsent(true)
        return
      }

      if (compassRes.status === 429) {
        setLimitReached(true)
        setNextAvailable(compassData.nextAvailable)
        setUsed(compassData.used || LIMIT)
        return
      }

      setAnswer(compassData.answer || 'Unable to retrieve an answer. Please try again.')
      if (compassData.used !== undefined) setUsed(compassData.used)
      if (compassData.remaining === 0) setLimitReached(true)
      if (compassData.nextAvailable) setNextAvailable(compassData.nextAvailable)

      if (bibleRes) {
        const bibleData = await bibleRes.json()
        if (bibleData.verses?.length) setVerses(bibleData.verses)
      }
    } catch {
      setAnswer('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [loading, limitReached])

  // Stable ref for submitQuestion (used in speech callbacks)
  const submitQuestionRef = useRef(submitQuestion)
  useEffect(() => { submitQuestionRef.current = submitQuestion }, [submitQuestion])

  // Stable ref for checkConsentAndSubmit
  const checkConsentRef = useRef(checkConsentAndSubmit)
  useEffect(() => { checkConsentRef.current = checkConsentAndSubmit }, [checkConsentAndSubmit])

  // ── Voice setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setVoiceSupported(!!SR)
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(interim)
      if (e.results[e.results.length - 1].isFinal) {
        const final = e.results[e.results.length - 1][0].transcript.trim()
        setQuestion(final)
        setTranscript('')
        setListening(false)
        // Use refs to avoid stale closures
        if (sessionRef.current) {
          checkConsentRef.current(final)
        } else {
          // Not signed in — save transcript, show auth gate
          pendingQuestion.current = final
          localStorage.setItem('fc_pending_question', final)
          setShowAuth(true)
        }
      }
    }
    rec.onerror = () => { setListening(false); setTranscript('') }
    rec.onend = () => { setListening(false); setTranscript('') }
    recognitionRef.current = rec
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      setQuestion('')
      setTranscript('')
      try { recognitionRef.current.start(); setListening(true) }
      catch { setListening(false) }
    }
  }

  // ── After OAuth social sign-in returns ────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return
    // Check for pending plan first — redirect to pricing
    if (session) {
      const pendingPlan = localStorage.getItem('fc_pending_plan')
      if (pendingPlan) {
        localStorage.removeItem('fc_pending_plan')
        router.push(`/pricing?plan=${pendingPlan}`)
        return
      }
    }
    // Then check for pending question
    const saved = localStorage.getItem('fc_pending_question')
    if (saved && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true
      localStorage.removeItem('fc_pending_question')
      sessionStorage.removeItem('fc_pending_question')
      setQuestion(saved)
      if (session) {
        checkConsentAndSubmit(saved)
      } else {
        submitQuestion(saved)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleAsk = () => {
    if (!question.trim() || loading || limitReached) return
    // Loading guard: if session is still resolving, show spinner
    if (status === 'loading') return
    if (session) {
      checkConsentAndSubmit(question)
      return
    }
    pendingQuestion.current = question
    localStorage.setItem('fc_pending_question', question)
    sessionStorage.setItem('fc_pending_question', question)
    setShowAuth(true)
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    // Check for pending plan first — redirect to pricing
    const pendingPlan = localStorage.getItem('fc_pending_plan')
    if (pendingPlan) {
      localStorage.removeItem('fc_pending_plan')
      router.push(`/pricing?plan=${pendingPlan}`)
      return
    }
    // Then check for pending question
    const q = pendingQuestion.current || question
    localStorage.removeItem('fc_pending_question')
    sessionStorage.removeItem('fc_pending_question')
    checkConsentAndSubmit(q)
  }

  const handleConsentAccepted = () => {
    setShowConsent(false)
    const q = pendingQuestion.current || question
    submitQuestion(q)
  }

  const handleDismiss = () => {
    localStorage.removeItem('fc_pending_question')
    sessionStorage.removeItem('fc_pending_question')
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <Header />

      {showUpgradeBanner && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-4 text-green-400 text-sm text-center mx-5 mt-4">
          🎉 Subscription active! Your daily limit has been upgraded. Ask away.
        </div>
      )}

      {showAuth && (
        <AuthModal
          pendingQuestion={pendingQuestion.current}
          onClose={handleDismiss}
          onSuccess={handleAuthSuccess}
        />
      )}

      {showConsent && (
        <ConsentModal
          onAccept={handleConsentAccepted}
          onClose={() => setShowConsent(false)}
        />
      )}

      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="flex items-start justify-between mb-2 gap-4">
          <h1 className="text-3xl font-bold leading-tight">Ask the<br /><span className="gold-text">Compass</span></h1>
          <span className="text-xs text-[#9CA3AF] text-right mt-1 shrink-0">
            {used}/{LIMIT} questions<br />used today
          </span>
        </div>
        <p className="text-[#374151] text-sm mb-6">
          Every answer is grounded in Scripture. No opinions — only the Word.
        </p>

        <div className="bg-[#080808] rounded-3xl border border-[#C9A84C]/20 p-6 mb-6">
        <div className={`bg-[#111111] border rounded-2xl p-5 transition-all ${listening ? 'border-red-400/60 shadow-[0_0_20px_rgba(248,113,113,0.15)]' : 'border-[#1A1A1A]'}`}>
          <div className="flex items-start gap-3">
            {/* Mic button */}
            {voiceSupported && (
              <button
                onClick={toggleVoice}
                title={listening ? 'Stop' : 'Speak your question'}
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all mt-1 ${
                  listening
                    ? 'bg-red-500/20 border border-red-400/50 text-red-400 animate-pulse'
                    : 'bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/20'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            )}
            <textarea
              className="flex-1 bg-transparent text-white placeholder-white/30 resize-none outline-none text-sm leading-relaxed"
              rows={4}
              placeholder={listening ? 'Listening... speak your question' : "Ask a faith or moral question... (e.g. 'What does the Bible say about forgiveness?')"}
              value={listening ? transcript || '' : question}
              onChange={(e) => { if (!listening) setQuestion(e.target.value.slice(0, 500)) }}
              disabled={limitReached || listening}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk() }}
            />
          </div>

          {listening && (
            <div className="mt-2 flex items-center gap-2 text-red-400 text-xs justify-center">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Listening... speak your faith question
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#1A1A1A]">
            <span className="text-xs text-white/30">{question.length}/500</span>
            <button
              onClick={handleAsk}
              disabled={!question.trim() || loading || limitReached || status === 'loading'}
              className="btn-gold px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Loading...
                </span>
              ) : loading ? 'Searching Scripture...' : 'Ask →'}
            </button>
          </div>
        </div>
        </div>

        {answer && (
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#C9A84C]">📖</span>
                <span className="text-sm font-medium text-[#C9A84C]">Scripture Response</span>
              </div>
              <button
                onClick={async () => {
                  const firstVerse = verses[0]
                  const shareText = firstVerse
                    ? `${firstVerse.reference}\n\n"${firstVerse.text}"\n\n${answer.slice(0, 200)}...\n\n— Faith Compass\nfaithcompass.app`
                    : `${answer.slice(0, 280)}...\n\n— Faith Compass\nfaithcompass.app`
                  if (navigator.share) {
                    await navigator.share({ title: 'Ask the Compass', text: shareText, url: 'https://faithcompass.app/compass' }).catch(() => {})
                  } else {
                    await navigator.clipboard.writeText(shareText).catch(() => {})
                    alert('Answer copied to clipboard!')
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[#C9A84C] transition px-2 py-1 rounded-lg hover:bg-[#111111]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
            </div>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {answer && (
          <CompassVoicePlayer
            text={answer}
            defaultVoice={savedVoice}
            onVoiceChange={(v) => {
              setSavedVoice(v)
              localStorage.setItem('fc_voice_id', v)
            }}
          />
        )}

        {verses.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-[#C9A84C]">Verified Scripture References</p>
            {verses.map((v) => {
              const slug = bookNameToSlug(v.book)
              return (
                <Link
                  key={v.id}
                  href={`/bible/${slug}/${v.chapter}?verse=${v.verse}`}
                  className="block bg-[#111111] border border-[#1A1A1A] border-l-2 border-l-[#C9A84C] rounded-xl p-4 hover:border-[#C9A84C]/40 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold gold-text">{v.reference}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        v.verified ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}
                      title={v.verified ? `SHA256: ${v.hash.slice(0, 16)}...` : 'Verification failed'}
                    >
                      {v.verified ? '🔒 Verified' : '⚠️ Unverified'}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm font-serif leading-relaxed">{v.text}</p>
                  <span className="text-xs text-[#C9A84C] mt-2 inline-block opacity-0 group-hover:opacity-100 transition">
                    Read in context →
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        {limitReached && <LimitGate nextAvailable={nextAvailable} />}
      </div>
    </main>
  )
}
