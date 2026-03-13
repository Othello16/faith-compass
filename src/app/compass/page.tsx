'use client'
import { useState } from 'react'
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

export default function CompassPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [used, setUsed] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const [nextAvailable, setNextAvailable] = useState<string | null>(null)
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const LIMIT = 3

  const askQuestion = async () => {
    if (!question.trim() || loading || limitReached) return
    setLoading(true)
    setAnswer('')
    setVerses([])
    try {
      // Fire compass and bible search in parallel
      const [compassRes, bibleRes] = await Promise.all([
        fetch('/api/compass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        }),
        fetch('/api/bible/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: question }),
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

      // Process Bible results
      if (bibleRes) {
        const bibleData = await bibleRes.json()
        if (bibleData.verses?.length) {
          setVerses(bibleData.verses)
        }
      }
    } catch {
      setAnswer('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <Header />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Ask the Compass</h1>
          <span className="text-sm text-white/50">
            {used}/{LIMIT} questions used today
          </span>
        </div>
        <p className="text-white/50 text-sm mb-8">
          Every answer is grounded in Scripture. No opinions — only the Word.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <textarea
            className="w-full bg-transparent text-white placeholder-white/30 resize-none outline-none text-sm leading-relaxed"
            rows={4}
            placeholder="Ask a faith or moral question... (e.g. 'What does the Bible say about forgiveness?' or 'How should I handle conflict with a family member?')"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={limitReached}
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <span className="text-xs text-white/30">{question.length}/500</span>
            <button
              onClick={askQuestion}
              disabled={!question.trim() || loading || limitReached}
              className="bg-[#1E40AF] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching Scripture...' : 'Ask →'}
            </button>
          </div>
        </div>

        {answer && (
          <div className="bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#D4AF37]">📖</span>
              <span className="text-sm font-medium text-[#D4AF37]">Scripture Response</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {/* Verified Bible Verses */}
        {verses.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-[#D4AF37]">Verified Scripture References</span>
            </div>
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
                        v.verified
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
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
