'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import LimitGate from '@/components/LimitGate'
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

// ── Sign-in gate modal ──────────────────────────────────────────────────────
function SignInModal({
  pendingQuestion,
  onClose,
  onSuccess,
}: {
  pendingQuestion: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/signup'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || `${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`)
      } else {
        onSuccess()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0F172A] border border-white/15 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="text-3xl">🧭</span>
          <h2 className="text-lg font-bold mt-2 mb-1">
            {mode === 'signin' ? 'Sign in to get your answer' : 'Create your account'}
          </h2>
          <p className="text-white/40 text-xs leading-relaxed">
            Your question is saved. Sign in and we&apos;ll submit it for you instantly.
          </p>
        </div>

        {/* Pending question preview */}
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-5 text-xs text-white/50 italic line-clamp-2">
          &ldquo;{pendingQuestion}&rdquo;
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="Email"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E40AF] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
              : (mode === 'signin' ? 'Sign In & Get My Answer' : 'Create Account & Ask')}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="text-white/40 text-xs hover:text-white/60 transition"
          >
            {mode === 'signin' ? "Don't have an account? Sign up free" : 'Already have an account? Sign in'}
          </button>
          <div>
            <button
              onClick={onClose}
              className="text-white/25 text-xs hover:text-white/40 transition"
            >
              Maybe later (continue as guest)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function CompassPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [used, setUsed] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const [nextAvailable, setNextAvailable] = useState<string | null>(null)
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const [showSignIn, setShowSignIn] = useState(false)
  const pendingQuestion = useRef('')
  const LIMIT = 3

  // On mount: check if we just returned from sign-in with a pending question
  useEffect(() => {
    const saved = sessionStorage.getItem('fc_pending_question')
    if (saved) {
      sessionStorage.removeItem('fc_pending_question')
      setQuestion(saved)
      submitQuestion(saved)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitQuestion = async (q: string) => {
    if (!q.trim() || loading || limitReached) return
    setLoading(true)
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
  }

  const handleAsk = () => {
    if (!question.trim() || loading || limitReached) return
    // Save question and show sign-in gate
    pendingQuestion.current = question
    sessionStorage.setItem('fc_pending_question', question)
    setShowSignIn(true)
  }

  const handleSignInSuccess = () => {
    setShowSignIn(false)
    // Question is already saved in sessionStorage; submit directly
    const q = pendingQuestion.current || question
    sessionStorage.removeItem('fc_pending_question')
    submitQuestion(q)
  }

  const handleGuestContinue = () => {
    // User dismissed sign-in — submit as guest
    setShowSignIn(false)
    const q = pendingQuestion.current || question
    sessionStorage.removeItem('fc_pending_question')
    submitQuestion(q)
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <Header />

      {showSignIn && (
        <SignInModal
          pendingQuestion={pendingQuestion.current}
          onClose={handleGuestContinue}
          onSuccess={handleSignInSuccess}
        />
      )}

      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="flex items-start justify-between mb-2 gap-4">
          <h1 className="text-3xl font-bold leading-tight">Ask the<br />Compass</h1>
          <span className="text-xs text-white/50 text-right mt-1 shrink-0">
            {used}/{LIMIT} questions<br />used today
          </span>
        </div>
        <p className="text-white/50 text-sm mb-6">
          Every answer is grounded in Scripture. No opinions — only the Word.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <textarea
            className="w-full bg-transparent text-white placeholder-white/30 resize-none outline-none text-sm leading-relaxed"
            rows={4}
            placeholder="Ask a faith or moral question... (e.g. 'What does the Bible say about forgiveness?' or 'How should I handle conflict with a family member?')"
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
            disabled={limitReached}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk()
            }}
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <span className="text-xs text-white/30">{question.length}/500</span>
            <button
              onClick={handleAsk}
              disabled={!question.trim() || loading || limitReached}
              className="bg-[#1E40AF] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching Scripture...' : 'Ask →'}
            </button>
          </div>
        </div>

        {answer && (
          <div className="bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#D4AF37]">📖</span>
              <span className="text-sm font-medium text-[#D4AF37]">Scripture Response</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {verses.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-[#D4AF37]">Verified Scripture References</p>
            {verses.map((v) => {
              const slug = bookNameToSlug(v.book)
              return (
                <Link
                  key={v.id}
                  href={`/bible/${slug}/${v.chapter}?verse=${v.verse}`}
                  className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#D4AF37]/40 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#D4AF37]">{v.reference}</span>
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
                  <span className="text-xs text-[#1E40AF] mt-2 inline-block opacity-0 group-hover:opacity-100 transition">
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
