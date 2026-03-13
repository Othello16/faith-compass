'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

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
  fallback?: boolean   // true = came from Compass AI, not OpenBible
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
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState<TopicResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
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
        handleSearch(final)
      }
    }
    recognition.onerror = () => { setListening(false); setTranscript('') }
    recognition.onend = () => { setListening(false); setTranscript('') }
    recognitionRef.current = recognition
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Compass AI fallback — fires when OpenBible returns 0 results
  const compassFallback = useCallback(async (q: string): Promise<TopicResult | null> => {
    try {
      const res = await fetch('/api/compass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `What does the Bible say about ${q}?` }),
      })
      if (!res.ok) return null
      const data = await res.json()
      if (!data.answer) return null
      return {
        topic: q,
        slug: q.toLowerCase().replace(/\s+/g, '_'),
        url: '',
        verses: [],
        count: 0,
        source: 'compass',
        fallback: true,
        fallbackAnswer: data.answer,
      }
    } catch {
      return null
    }
  }, [])

  const handleSearch = useCallback(async (searchTopic?: string) => {
    const q = (searchTopic || topic).trim()
    if (!q || loading) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Primary: OpenBible.info topical index
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: q }),
      })
      const data = await res.json()

      if (!res.ok || !data.verses || data.verses.length === 0) {
        // Fallback: use Compass AI to answer the topic question
        const fallback = await compassFallback(q)
        if (fallback) {
          setResult(fallback)
        } else {
          setError(`No results found for "${q}". Try a simpler topic like "prayer" or "faith".`)
        }
        return
      }

      setResult(data)
    } catch {
      // Network error — still try the Compass fallback
      const fallback = await compassFallback(q)
      if (fallback) {
        setResult(fallback)
      } else {
        setError('Connection failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [topic, loading, compassFallback])

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

  const handleAskCompass = () => {
    const q = topic.trim() || result?.topic || ''
    if (!q) return
    sessionStorage.setItem('fc_pending_question', `What does the Bible say about ${q}?`)
    router.push('/compass')
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <Header />

      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Topical Bible</h1>
          <p className="text-white/50 text-sm">
            Speak or type any topic — see every Scripture that speaks to it.
          </p>
        </div>

        {/* Search bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-3">
            {voiceSupported && (
              <button
                onClick={toggleVoice}
                title={listening ? 'Stop listening' : 'Speak your topic'}
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  listening
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse'
                    : 'bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20'
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
            <button
              onClick={() => handleSearch()}
              disabled={(!topic.trim() && !listening) || loading}
              className="shrink-0 bg-[#1E40AF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
          {listening && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-xs">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Listening... say a Bible topic
            </div>
          )}
        </div>

        {/* Ask the Compass button — always visible below input */}
        <button
          onClick={handleAskCompass}
          disabled={!topic.trim() && !result}
          className="w-full flex items-center justify-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#D4AF37]/20 transition disabled:opacity-30 mb-6"
        >
          <span>🧭</span>
          <span>Ask the Compass{result ? ` about ${result.topic}` : ''}</span>
          <span className="text-xs text-[#D4AF37]/60">→ Scripture AI with KJV verification</span>
        </button>

        {/* Popular topic chips */}
        {!result && !loading && (
          <div className="mb-8">
            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">Popular topics</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => { setTopic(t); handleSearch(t) }}
                  className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/60 hover:text-white hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition capitalize"
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

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                <div className="h-3 w-28 bg-white/10 rounded mb-3" />
                <div className="h-3 w-full bg-white/5 rounded mb-2" />
                <div className="h-3 w-4/5 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold capitalize">{result.topic}</h2>
                <p className="text-xs text-white/40 mt-0.5">
                  {result.fallback
                    ? 'Scripture AI answer (Compass) — OpenBible index unavailable for this topic'
                    : `${result.count} scriptures — sorted by community relevance`}
                </p>
              </div>
              {!result.fallback && result.url && (
                <a href={result.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-white/30 hover:text-white/60 transition shrink-0">
                  openbible.info ↗
                </a>
              )}
            </div>

            {/* Fallback: Compass AI answer */}
            {result.fallback && result.fallbackAnswer && (
              <div className="bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#D4AF37]">🧭</span>
                  <span className="text-sm font-medium text-[#D4AF37]">Compass Scripture Answer</span>
                  <span className="text-xs text-white/30 ml-auto">KJV · AI-assisted</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{result.fallbackAnswer}</p>
              </div>
            )}

            {/* OpenBible verse list */}
            {!result.fallback && (
              <div className="space-y-3">
                {result.verses.map((verse, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#D4AF37]/30 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#D4AF37]">{verse.reference}</span>
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
      </div>
    </main>
  )
}
