'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function IntegrityPage() {
  const [content, setContent] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const MAX_CHARS = 2000

  const analyzeContent = async () => {
    if (!content.trim() || loading) return
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
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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
        <div className="flex gap-4 items-center">
          <Link href="/compass" className="text-sm text-white/70 hover:text-white transition">Compass</Link>
          <Link href="/churches" className="text-sm text-white/70 hover:text-white transition">Churches</Link>
          <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Faith Integrity Check</h1>
        <p className="text-white/50 text-sm mb-2">
          Paste a sermon, article, or devotional. AI cross-references it against Scripture and flags concerns.
        </p>
        <p className="text-[#D4AF37]/60 text-xs mb-8">
          This is a discernment tool, not a judgment of people.
        </p>

        {/* Input */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <textarea
            className="w-full bg-transparent text-white placeholder-white/30 resize-none outline-none text-sm leading-relaxed"
            rows={8}
            placeholder="Paste sermon text, article, or devotional content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CHARS}
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <span className="text-xs text-white/30">{content.length}/{MAX_CHARS} characters</span>
            <button
              onClick={analyzeContent}
              disabled={!content.trim() || loading}
              className="bg-[#1E40AF] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Check Integrity'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#D4AF37]">🔍</span>
              <span className="text-sm font-medium text-[#D4AF37]">Integrity Analysis</span>
            </div>
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</div>
          </div>
        )}

        {/* Tier info */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-white/40 text-xs">
            Free tier: up to {MAX_CHARS} characters per check.
            <Link href="/pricing" className="text-[#D4AF37] hover:text-yellow-400 ml-1">Upgrade to Pro</Link>
            {' '}for extended analysis and PDF exports.
          </p>
        </div>
      </div>
    </main>
  )
}
