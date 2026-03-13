'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

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

export default function Home() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [dailyQuestion, setDailyQuestion] = useState('')
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  // Load daily question
  useEffect(() => {
    fetch('/api/daily-question')
      .then(r => r.json())
      .then(d => setDailyQuestion(d.question))
      .catch(() => {})
  }, [])

  // Voice setup
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
        handleAsk(final)
      }
    }
    rec.onerror = () => { setListening(false); setTranscript('') }
    rec.onend = () => { setListening(false); setTranscript('') }
    recognitionRef.current = rec
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAsk = (q?: string) => {
    const query = (q || question).trim()
    if (!query) return
    sessionStorage.setItem('fc_pending_question', query)
    router.push('/compass')
  }

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

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 pt-16 pb-14 text-center" style={{ background: 'radial-gradient(ellipse at center, #111111 0%, #080808 70%)' }}>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 text-[#C9A84C] text-xs px-3 py-1 rounded-full border border-[#C9A84C]/30 mb-5">
          <span>✦</span>
          <span>Scripture-verified • Clergy-overseen • Built on the Word</span>
          <span>✦</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight tracking-tight">
          Ask the <span className="text-[#C9A84C]">Compass.</span>
        </h1>
        <p className="text-[#9CA3AF] text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
          Scripture-grounded answers. No opinion. No noise. Just the Word.
        </p>

        {/* ── ASK THE COMPASS INPUT ── */}
        <div className={`bg-[#111111] border rounded-2xl p-4 transition-all ${listening ? 'border-red-400/60 shadow-[0_0_20px_rgba(248,113,113,0.15)]' : 'border-[#1A1A1A] hover:border-[#C9A84C]/30'}`}>
          <div className="flex items-center gap-3">
            {/* Mic button */}
            {voiceSupported && (
              <button
                onClick={toggleVoice}
                title={listening ? 'Stop' : 'Speak your question'}
                className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  listening
                    ? 'bg-red-500/20 border border-red-400/50 text-red-400 animate-pulse'
                    : 'bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/20'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            )}

            <input
              type="text"
              value={listening ? transcript || '' : question}
              onChange={e => { if (!listening) setQuestion(e.target.value) }}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder={listening ? 'Listening... speak your question' : 'Ask anything. "What does the Bible say about..."'}
              disabled={listening}
              className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm sm:text-base"
            />
          </div>

          {listening && (
            <div className="mt-2 flex items-center gap-2 text-red-400 text-xs justify-center">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Listening... speak your faith question
            </div>
          )}

          <button
            onClick={() => handleAsk()}
            disabled={!question.trim() && !listening}
            className="mt-3 w-full bg-[#C9A84C] text-black py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-[#E8C96E] transition disabled:opacity-30"
          >
            Ask the Compass 🧭
          </button>
        </div>

        {/* Daily Question prompt */}
        {dailyQuestion && (
          <div className="mt-4">
            <p className="text-white/30 text-xs mb-2">✦ Today&apos;s Compass Question</p>
            <button
              onClick={() => handleAsk(dailyQuestion)}
              className="text-xs text-[#C9A84C]/70 hover:text-[#C9A84C] transition italic leading-relaxed text-center max-w-md mx-auto block"
            >
              &ldquo;{dailyQuestion}&rdquo; →
            </button>
          </div>
        )}

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-white/30">
          <span>🔒 SHA-256 Verified Scripture</span>
          <span>📖 31,100 KJV Verses Indexed</span>
          <span>⛪ Clergy Advisory Oversight</span>
          <span>🌍 Free to Ask</span>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🧭', title: 'Ask the Compass', desc: 'Voice or text. Any faith question. Scripture answers — never opinions.', href: '/compass', cta: 'Ask now' },
          { icon: '🎙️', title: 'Voice Topical Bible', desc: 'Speak any topic — grief, hope, marriage — and hear every verse that speaks to it.', href: '/topics', cta: 'Try it' },
          { icon: '⛪', title: 'Church Finder', desc: 'Locate verified congregations near you. Real churches, real community.', href: '/churches', cta: 'Find churches' },
          { icon: '🔍', title: 'Integrity Check', desc: 'Paste any sermon or article. AI cross-references it with Scripture.', href: '/integrity', cta: 'Check content' },
        ].map(f => (
          <Link
            key={f.title}
            href={f.href}
            className="group bg-[#111111] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#C9A84C]/40 hover:bg-white/8 transition flex flex-col"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-sm font-semibold text-[#C9A84C] mb-1">{f.title}</h3>
            <p className="text-white/50 text-xs leading-relaxed flex-1">{f.desc}</p>
            <span className="text-xs text-[#C9A84C] mt-3 opacity-0 group-hover:opacity-100 transition">{f.cta} →</span>
          </Link>
        ))}
      </section>

      {/* ── TRUST / ADVISORY ─────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-12 text-center">
        <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8">
          <div className="text-[#C9A84C] text-xs uppercase tracking-widest mb-4">Theological Advisory</div>
          <blockquote className="text-white/70 text-sm sm:text-base italic leading-relaxed mb-6">
            &ldquo;Faith Compass was built to honor the integrity of the Word. Every answer points back to Scripture,
            every feature is designed to strengthen — never replace — the relationship between a believer and their God.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-lg">✝️</div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Rev. Dr. Renn S. Law II, D.Min.</p>
              <p className="text-white/40 text-xs">Theological Advisory Lead, Faith Compass</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE DIFFERENCE ───────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 pb-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Built Different. On Purpose.</h2>
        <p className="text-white/50 text-sm mb-6 max-w-lg mx-auto">
          Other AI apps try to replace your pastor. Some even pretend to be Jesus.
          Faith Compass was built by people who heard the warning — and decided to build the answer.
        </p>
        <div className="grid grid-cols-2 gap-3 text-left max-w-xl mx-auto">
          {[
            ['❌ AI posing as God', '✅ AI pointing to God'],
            ['❌ Fake faith content', '✅ Scripture-verified answers'],
            ['❌ Emotional AI dependency', '✅ Connection to real churches'],
            ['❌ Hidden agendas', '✅ Clergy-overseen integrity'],
          ].map(([bad, good]) => (
            <div key={good} className="bg-[#111111] rounded-xl p-3 border border-[#1A1A1A]">
              <p className="text-red-400 text-xs mb-1">{bad}</p>
              <p className="text-green-400 text-xs font-medium">{good}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Simple, Honest Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { name: 'Compass Free', price: '$0', period: 'forever', features: ['3 questions/day', 'Voice Topical Bible', 'Church finder', 'Scripture lookup'], cta: 'Get Started', highlight: false },
            { name: 'Compass Guided', price: '$3', period: '/month', features: ['500 questions/month', 'No daily cap', 'Question history', 'Bookmarks'], cta: 'Start Guided', highlight: false },
            { name: 'Compass Pro', price: '$7.77', period: '/month', features: ['1,500 questions/month', 'Integrity Check', 'Priority answers', 'PDF exports'], cta: 'Go Pro', highlight: true },
          ].map(tier => (
            <div key={tier.name} className={`rounded-2xl p-5 border ${tier.highlight ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-[#1A1A1A] bg-[#111111]'}`}>
              <h3 className="text-sm font-semibold mb-1">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-[#C9A84C]">{tier.price}</span>
                <span className="text-white/40 text-xs">{tier.period}</span>
              </div>
              <ul className="space-y-1.5 mb-5">
                {tier.features.map(f => (
                  <li key={f} className="text-xs text-white/60 flex items-center gap-2">
                    <span className="text-[#C9A84C]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/compass"
                className={`block text-center py-2 rounded-lg text-xs font-semibold transition ${tier.highlight ? 'bg-[#C9A84C] text-black hover:bg-[#E8C96E]' : 'bg-[#1A1A1A] text-white hover:bg-white/20'}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-white/30 text-xs mt-4">
          The $7.77 price is intentional. 777 = divine completion. ♃
        </p>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[#C9A84C]/20 px-5 py-8 text-center text-xs">
        <div className="flex justify-center items-center gap-5 mb-3 text-[#C9A84C]/40">
          <span>v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</span>
          <Link href="/about" className="hover:text-[#C9A84C] transition">About</Link>
          <Link href="/privacy" className="hover:text-[#C9A84C] transition">Privacy</Link>
          <Link href="/terms" className="hover:text-[#C9A84C] transition">Terms</Link>
          <Link href="/topics" className="hover:text-[#C9A84C] transition">Topical Bible</Link>
        </div>
        <p className="text-white/20">© 2026 Faith Compass. Built with faith and purpose.</p>
        <p className="mt-1 text-xs text-white/15">A Rising Jupiter Initiative • MostHighKing Ministries</p>
        <p className="mt-1 text-xs text-white/15">Theological Advisory: Rev. Dr. Renn S. Law II, D.Min.</p>
      </footer>
    </main>
  )
}
