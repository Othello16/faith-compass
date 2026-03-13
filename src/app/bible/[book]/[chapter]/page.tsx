'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { BOOK_SLUGS, ABBREV_TO_SLUG } from '@/lib/bible'

interface Verse {
  id: string
  book: string
  bookAbbrev: string
  chapter: number
  verse: number
  text: string
  hash: string
}

export default function BibleChapterPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const bookSlug = params.book as string
  const chapterNum = params.chapter as string
  const highlightVerse = searchParams.get('verse')

  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookName, setBookName] = useState('')

  const bookAbbrev = BOOK_SLUGS[bookSlug]

  useEffect(() => {
    if (!bookAbbrev || !chapterNum) {
      setError('Invalid book or chapter')
      setLoading(false)
      return
    }

    fetch(`/bible/chapters/${bookAbbrev}-${chapterNum}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Chapter not found')
        return res.json()
      })
      .then((data: Verse[]) => {
        setVerses(data)
        if (data.length > 0) setBookName(data[0].book)
        setLoading(false)
      })
      .catch(() => {
        setError('Chapter not found')
        setLoading(false)
      })
  }, [bookAbbrev, chapterNum])

  useEffect(() => {
    if (highlightVerse && !loading) {
      const el = document.getElementById(`verse-${highlightVerse}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [highlightVerse, loading])

  // Compute prev/next chapter navigation
  const ch = parseInt(chapterNum)
  const prevChapter = ch > 1 ? ch - 1 : null
  const allSlugs = Object.keys(BOOK_SLUGS)
  const currentSlugIdx = allSlugs.indexOf(bookSlug)

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <Header />

      <div className="max-w-2xl mx-auto px-6 py-12">
        {loading && (
          <div className="text-center py-20 text-[#9CA3AF]">Loading chapter...</div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Link href="/compass" className="text-[#C9A84C] hover:text-[#E8C96E] text-sm">
              Back to Compass
            </Link>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-serif font-bold gold-text mb-1">
                {bookName}
              </h1>
              <p className="text-[#9CA3AF] text-sm">Chapter {chapterNum}</p>
            </div>

            <div className="space-y-4">
              {verses.map((v) => {
                const isHighlighted = highlightVerse === String(v.verse)
                return (
                  <p
                    key={v.verse}
                    id={`verse-${v.verse}`}
                    className={`font-serif text-base leading-relaxed transition-colors ${
                      isHighlighted
                        ? 'bg-[#C9A84C]/10 border-l-2 border-[#C9A84C] pl-4 py-2 text-[#0A0A0A]'
                        : 'text-[#374151]'
                    }`}
                  >
                    <sup className="text-xs text-[#9CA3AF] mr-1 font-sans">{v.verse}</sup>
                    {v.text}
                  </p>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-[#E5E7EB]">
              {prevChapter ? (
                <Link
                  href={`/bible/${bookSlug}/${prevChapter}`}
                  className="text-sm text-[#C9A84C] hover:text-[#E8C96E] transition"
                >
                  ← Chapter {prevChapter}
                </Link>
              ) : currentSlugIdx > 0 ? (
                <Link
                  href={`/bible/${allSlugs[currentSlugIdx - 1]}/1`}
                  className="text-sm text-[#C9A84C] hover:text-[#E8C96E] transition"
                >
                  ← Previous Book
                </Link>
              ) : (
                <span />
              )}
              <Link
                href={`/bible/${bookSlug}/${ch + 1}`}
                className="text-sm text-[#C9A84C] hover:text-[#E8C96E] transition"
              >
                Chapter {ch + 1} →
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
