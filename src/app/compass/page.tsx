'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function CompassPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionsUsed, setQuestionsUsed] = useState(0)
  const MAX_FREE = 7

  const askQuestion = async () => {
    if (!question.trim() || loading || questionsUsed >= MAX_FREE) return
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch('/api/compass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      setAnswer(data.answer || 'Unable to retrieve an answer. Please try again.')
      setQuestionsUsed((q) => q + 1)
    } catch {
      setAnswer('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="text-xl font-bold text-[#D4AF37]">Faith Compass</span>
        </Link>
        <div className="text-sm text-white/50">
          {questionsUsed}/{MAX_FREE} questions used today
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Ask the Compass</h1>
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
            disabled={questionsUsed >= MAX_FREE}
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <span className="text-xs text-white/30">{question.length}/500</span>
            <button
              onClick={askQuestion}
              disabled={!question.trim() || loading || questionsUsed >= MAX_FREE}
              className="bg-[#1E40AF] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching Scripture...' : 'Ask →'}
            </button>
          </div>
        </div>

        {answer && (
          <div className="bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#D4AF37]">📖</span>
              <span className="text-sm font-medium text-[#D4AF37]">Scripture Response</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {questionsUsed >= MAX_FREE && (
          <div className="mt-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6 text-center">
            <p className="text-[#D4AF37] font-semibold mb-2">Daily limit reached (7/7)</p>
            <p className="text-white/60 text-sm mb-4">Upgrade for 500+ questions per month with no daily limits.</p>
            <Link href="/pricing" className="bg-[#D4AF37] text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition">
              Upgrade for $3/month →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
