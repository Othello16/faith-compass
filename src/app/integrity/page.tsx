'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import LimitGate from '@/components/LimitGate'

export default function IntegrityPage() {
  const [content, setContent] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [nextAvailable, setNextAvailable] = useState<string | null>(null)
  const [used, setUsed] = useState(0)
  const MAX_CHARS = 2000
  const LIMIT = 3

  const analyzeContent = async () => {
    if (!content.trim() || loading || limitReached) return
    setLoading(true)
    setError('')
    setAnalysis('')
    try {
      const res = await fetch('/api/integrity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.slice(0, MAX_CHARS) }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setLimitReached(true)
        setNextAvailable(data.nextAvailable)
        setUsed(data.used || LIMIT)
        return
      }

      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAnalysis(data.analysis)
      if (data.used !== undefined) setUsed(data.used)
      if (data.remaining === 0) setLimitReached(true)
      if (data.nextAvailable) setNextAvailable(data.nextAvailable)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <Header />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Faith Integrity Check</h1>
          <span className="text-sm text-[#9CA3AF]">
            {used}/{LIMIT} questions used today
          </span>
        </div>
        <p className="text-[#374151] text-sm mb-2">
          Paste a sermon, article, or devotional. AI cross-references it against Scripture and flags concerns.
        </p>
        <p className="text-[#C9A84C]/60 text-xs mb-8">
          This is a discernment tool, not a judgment of people.
        </p>

        <div className="bg-[#080808] rounded-2xl border border-[#C9A84C]/20 p-6 mb-6">
          <textarea
            className="w-full bg-transparent text-white placeholder-white/30 resize-none outline-none text-sm leading-relaxed"
            rows={8}
            placeholder="Paste sermon text, article, or devotional content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CHARS}
            disabled={limitReached}
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#1A1A1A]">
            <span className="text-xs text-white/30">{content.length}/{MAX_CHARS} characters</span>
            <button
              onClick={analyzeContent}
              disabled={!content.trim() || loading || limitReached}
              className="btn-gold px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Check Integrity'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#C9A84C]">🔍</span>
              <span className="text-sm font-medium text-[#C9A84C]">Integrity Analysis</span>
            </div>
            <div className="text-[#1A1A1A] text-sm leading-relaxed whitespace-pre-wrap">{analysis}</div>
          </div>
        )}

        {limitReached && <LimitGate nextAvailable={nextAvailable} plan="free" used={used} limit={LIMIT} />}

        <div className="mt-8 bg-[#FAFAF8] border border-[#E5E7EB] rounded-xl p-4 text-center">
          <p className="text-[#9CA3AF] text-xs">
            Free tier: up to {MAX_CHARS} characters per check.
            <Link href="/pricing" className="text-[#C9A84C] hover:text-[#E8C96E] ml-1">Upgrade to Pro</Link>
            {' '}for extended analysis and PDF exports.
          </p>
        </div>
      </div>
    </main>
  )
}
