import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

interface BibleVerse {
  id: string
  book: string
  bookNum: number
  bookAbbrev: string
  chapter: number
  verse: number
  text: string
  hash: string
}

let cachedIndex: BibleVerse[] | null = null

function loadIndex(): BibleVerse[] {
  if (cachedIndex) return cachedIndex
  const indexPath = path.join(process.cwd(), 'public', 'bible', 'kjv-index.json')
  if (!fs.existsSync(indexPath)) {
    throw new Error('Bible index not found. Run: npx tsx scripts/build-bible-index.ts')
  }
  cachedIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
  return cachedIndex!
}

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const { query } = await req.json()
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const index = loadIndex()

    // Step 1: Ask GPT to identify the most relevant verse references for this query
    const searchCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a Bible verse reference finder. Given a question or topic, return the 5 most relevant KJV Bible verse references that answer or address the query. Return ONLY a JSON array of verse reference strings in the format "Book Chapter:Verse" (e.g. ["John 3:16", "Romans 8:28", "Psalm 23:1", "Proverbs 3:5", "Isaiah 40:31"]). No explanation, no markdown, just the JSON array.`,
        },
        { role: 'user', content: query.slice(0, 500) },
      ],
      max_tokens: 200,
      temperature: 0.2,
    })

    const refsRaw = searchCompletion.choices[0]?.message?.content || '[]'
    let refs: string[]
    try {
      refs = JSON.parse(refsRaw)
    } catch {
      refs = []
    }

    // Step 2: Match references to actual verses in the index
    const matchedVerses: Array<{
      id: string
      book: string
      chapter: number
      verse: number
      text: string
      hash: string
      reference: string
      verified: boolean
    }> = []

    for (const ref of refs.slice(0, 5)) {
      const matched = findVerseByReference(ref, index)
      if (matched) {
        // Verify hash
        const computedHash = crypto.createHash('sha256').update(matched.text).digest('hex')
        const verified = computedHash === matched.hash

        matchedVerses.push({
          id: matched.id,
          book: matched.book,
          chapter: matched.chapter,
          verse: matched.verse,
          text: matched.text,
          hash: matched.hash,
          reference: `${matched.book} ${matched.chapter}:${matched.verse}`,
          verified,
        })
      }
    }

    return NextResponse.json({ verses: matchedVerses, query })
  } catch (err) {
    console.error('Bible search error:', err)
    return NextResponse.json({ error: 'Failed to search Bible' }, { status: 500 })
  }
}

function findVerseByReference(ref: string, index: BibleVerse[]): BibleVerse | undefined {
  // Parse reference like "John 3:16", "1 Corinthians 13:4", "Psalm 23:1"
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/)
  if (!match) return undefined

  const bookName = match[1].trim()
  const chapter = parseInt(match[2])
  const verse = parseInt(match[3])

  // Normalize book name for matching
  const normalized = bookName.toLowerCase().replace(/\s+/g, ' ')

  return index.find((v) => {
    const vBookNorm = v.book.toLowerCase()
    // Handle Psalm/Psalms
    const bookMatch =
      vBookNorm === normalized ||
      vBookNorm === normalized + 's' ||
      vBookNorm.replace('psalms', 'psalm') === normalized ||
      normalized.replace('psalm', 'psalms') === vBookNorm
    return bookMatch && v.chapter === chapter && v.verse === verse
  })
}
