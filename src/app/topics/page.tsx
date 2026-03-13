'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import AuthModal from '@/components/AuthModal'
import LimitGate from '@/components/LimitGate'

interface TopicVerse {
  reference: string
  text: string
  votes: number
}

interface TopicResult {
  topic: string
  slug: string
  url: string
  verses: TopicVerse[]
  count: number
  source: string
  message?: string
  fallback?: boolean
  fallbackAnswer?: string
}

const POPULAR_TOPICS = [
  'forgiveness', 'anxiety', 'faith', 'prayer', 'love',
  'hope', 'strength', 'marriage', 'money', 'grief',
  'anger', 'healing', 'wisdom', 'fear', 'purpose',
  'salvation', 'kindness', 'peace', 'temptation', 'trust',
]

interface ISpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number
  start(): void; stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: ((event: Event) => void) | null
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

export default function TopicsPage() {
  const { data: session, status } = useSession()
  // sessionRef keeps a live reference accessible from speech recognition callbacks
  // (avoids stale closure — useEffect([]) captures session at mount, before it resolves)
  const sessionRef = useRef(session)
  useEffect(() => { sessionRef.current = session }, [session])

  const [topic, setTopic] = useState('')
  const [result, setResult] = useState<TopicResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [transcript, setTranscript] = useState('')

  // Auth gate state
  const [showAuth, setShowAuth] = useState(false)
  const pendingTopic = useRef('')
  const hasAutoSubmitted = useRef(false)

  // Limit state (for Compass AI fallback)
  const [limitReached, setLimitReached] = useState(false)
  const [nextAvailable, setNextAvailable] = useState<string | null>(null)

  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setVoiceSupported(!!SR)
    if (!SR) return
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const interim = Array.from(event.results).map(r => r[0].transcript).join('')
      setTranscript(interim)
      if (event.results[event.results.length - 1].isFinal) {
        const final = event.results[event.results.length - 1][0].transcript.trim()
        setTopic(final)
        setTranscript('')
        setListening(false)
        // Use sessionRef (not session) — avoids stale closure in this callback
        if (sessionRef.current) {
          // Already signed in — go straight to search
          executeSearchRef.current(final)
        } else {
          // Not signed in — save topic, show auth gate
          pendingTopic.current = final
          localStorage.setItem('fc_pending_topic', final)
          setShowAuth(true)
        }
      }
    }
    recognition.onerror = () => { setListening(false); setTranscript('') }
    recognition.onend = () => { setListening(false); setTranscript('') }
    recognitionRef.current = recognition
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // After social OAuth returns: restore pending voice topic from localStorage
  useEffect(() => {
    if (status === 'loading') return
    const saved = localStorage.getItem('fc_pending_topic')
    if (saved && session && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true
      localStorage.removeItem('fc_pending_topic')
      setTopic(saved)
      executeSearch(saved)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session])

  // ── Text/chip search — free for OpenBible; gate Compass AI fallback ──────
  const handleSearch = (searchTopic?: string) => {
    const q = (searchTopic || topic).trim()
    if (!q || loading) return
    executeSearch(q)
  }

  // ── "Ask the Compass" — same auth+limit flow, runs inline (no redirect) ──
  const handleAskCompass = () => {
    const q = topic.trim() || result?.topic || ''
    if (!q) return
    if (session) {
      executeSearch(q)
    } else {
      pendingTopic.current = q
      localStorage.setItem('fc_pending_topic', q)
      setShowAuth(true)
    }
  }

  // ── Core search execution ────────────────────────────────────────────────
  // executeSearchRef keeps a stable ref for the speech recognition stale closure
  const executeSearchRef = useRef<(q: string) => void>(() => {})
  const executeSearch = useCallback(async (q: string) => {
    if (!q || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    setShowAuth(false)

    try {
      // Primary: OpenBible.info — free, no auth needed
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: q }),
      })
      const data = await res.json()

      if (res.ok && data.verses && data.verses.length > 0) {
        setResult(data)
        return
      }

      // No results from OpenBible — fall back to Compass AI (uses credit)
      // Check if user is signed in for the AI fallback
      if (!session) {
        // Show auth gate, save the topic, then after sign-in the fallback will run
        pendingTopic.current = q
        localStorage.setItem('fc_pending_topic', q)
        setShowAuth(true)
        return
      }

      // Signed in — run Compass AI fallback (charges a credit)
      await runCompassFallback(q)

    } catch {
      if (!session) {
        pendingTopic.current = q
        localStorage.setItem('fc_pending_topic', q)
        setShowAuth(true)
      } else {
        await runCompassFallback(q)
      }
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loading])

  // Keep ref in sync with latest executeSearch
  useEffect(() => { executeSearchRef.current = executeSearch }, [executeSearch])

  const runCompassFallback = async (q: string) => {
    try {
      const res = await fetch('/api/compass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `What does the Bible say about ${q}?` }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setLimitReached(true)
        setNextAvailable(data.nextAvailable)
        return
      }

      if (data.answer) {
        setResult({
          topic: q,
          slug: q.toLowerCase().replace(/\s+/g, '_'),
          url: '',
          verses: [],
          count: 0,
          source: 'compass',
          fallback: true,
          fallbackAnswer: data.answer,
        })
      } else {
        setError(`No results found for "${q}". Try a simpler topic like "prayer" or "faith".`)
      }
    } catch {
      setError('Connection failed. Please try again.')
    }
  }

  // ── Auth success callback ────────────────────────────────────────────────
  const handleAuthSuccess = () => {
    setShowAuth(false)
    const q = pendingTopic.current || topic
    localStorage.removeItem('fc_pending_topic')
    if (q) executeSearch(q)
  }

  const handleAuthDismiss = () => {
    setShowAuth(false)
    localStorage.removeItem('fc_pending_topic')
  }

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      setTopic('')
      setTranscript('')
      try { recognitionRef.current.start(); setListening(true) }
      catch { setListening(false) }
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <Header />

      {/* Auth gate modal — same flow as Compass */}
      {showAuth && (
        <AuthModal
          previewLabel="Your topic is ready:"
          pendingText={pendingTopic.current || topic || '(voice topic)'}
          callbackUrl="/topics"
          onClose={handleAuthDismiss}
          onSuccess={handleAuthSuccess}
        />
      )}

      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1 text-[#0A0A0A]">Topical Bible</h1>
          <p className="text-[#374151] text-sm">
            Speak or type any topic — see every Scripture that speaks to it.
          </p>
        </div>

        {/* Search bar — dark panel */}
        <div className="bg-[#080808] rounded-2xl border border-[#C9A84C]/20 p-4 mb-3">
          <div className="flex items-center gap-3">
            {voiceSupported && (
              <button
                onClick={toggleVoice}
                title={listening ? 'Stop listening' : 'Speak your topic'}
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  listening
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse'
                    : 'btn-gold'
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
            <input
              ref={inputRef}
              type="text"
              value={listening ? transcript || '' : topic}
              onChange={e => { if (!listening) setTopic(e.target.value) }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={listening ? 'Listening...' : 'Type a topic — "anxiety", "forgiveness", "prayer"'}
              disabled={listening}
              className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
            />
          </div>
          {listening && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-xs">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Listening... say a Bible topic
              {!session && <span className="text-white/30 ml-1">(sign-in required)</span>}
            </div>
          )}
          <button
            onClick={() => handleSearch()}
            disabled={(!topic.trim() && !listening) || loading}
            className="btn-gold mt-3 w-full py-3 rounded-xl text-sm font-semibold transition disabled:opacity-40"
          >
            {loading ? 'Searching...' : 'Search Scriptures'}
          </button>
        </div>

        {/* Ask the Compass CTA — runs Compass AI inline (auth + limit gated) */}
        <button
          onClick={handleAskCompass}
          disabled={(!topic.trim() && !result) || loading || limitReached}
          className="w-full flex items-center justify-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#C9A84C]/20 transition disabled:opacity-30 mb-6"
        >
          <span>🧭</span>
          <span>Ask the Compass{topic.trim() ? ` about "${topic.trim()}"` : result ? ` about ${result.topic}` : ''}</span>
        </button>

        {/* Popular topic chips */}
        {!result && !loading && (
          <div className="mb-8">
            <p className="text-xs text-[#9CA3AF] mb-3 uppercase tracking-wider">Popular topics</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => { setTopic(t); handleSearch(t) }}
                  className={`rounded-full px-3 py-1 text-xs transition capitalize ${
                    topic === t
                      ? 'bg-[#080808] border border-[#C9A84C] text-[#C9A84C]'
                      : 'bg-white border border-gray-200 text-[#374151] hover:border-[#C9A84C] hover:text-[#C9A84C] hover:shadow-sm'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Limit reached — upgrade prompt */}
        {limitReached && <LimitGate nextAvailable={nextAvailable} plan="free" used={0} limit={3} />}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[#111111] border border-[#1A1A1A] rounded-xl p-4 animate-pulse">
                <div className="h-3 w-28 bg-[#1A1A1A] rounded mb-3" />
                <div className="h-3 w-full bg-[#111111] rounded mb-2" />
                <div className="h-3 w-4/5 bg-[#111111] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold capitalize text-[#0A0A0A]">{result.topic}</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {result.fallback
                    ? 'Scripture AI answer (Compass) — OpenBible index unavailable for this topic'
                    : `${result.count} scriptures — sorted by community relevance`}
                </p>
              </div>
              {!result.fallback && result.url && (
                <a href={result.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#9CA3AF] hover:text-[#374151] transition shrink-0">
                  openbible.info ↗
                </a>
              )}
            </div>

            {/* Fallback: Compass AI answer */}
            {result.fallback && result.fallbackAnswer && (
              <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#C9A84C]">🧭</span>
                  <span className="text-sm font-medium text-[#C9A84C]">Compass Scripture Answer</span>
                  <span className="text-xs text-white/30 ml-auto">KJV · AI-assisted</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{result.fallbackAnswer}</p>
              </div>
            )}

            {/* OpenBible verse list */}
            {!result.fallback && (
              <div className="space-y-3">
                {result.verses.map((verse, i) => (
                  <div key={i} className="bg-[#111111] border border-[#1A1A1A] border-l-2 border-l-[#C9A84C] rounded-xl p-4 hover:border-[#C9A84C]/30 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold gold-text">{verse.reference}</span>
                      {verse.votes > 0 && (
                        <span className="text-xs text-white/30 flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                          {verse.votes.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-white/75 text-sm font-serif leading-relaxed">{verse.text}</p>
                    <p className="text-xs text-white/20 mt-2">ESV — via OpenBible.info</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sign-in nudge for unauthenticated users */}
        {!session && !loading && !result && !limitReached && (
          <div className="mt-4 text-center">
            <p className="text-[#9CA3AF] text-xs">
              🔒 Voice search and AI-powered results require a free account.{' '}
              <Link href="/compass" className="text-[#C9A84C]/60 hover:text-[#C9A84C] underline">Sign in →</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
