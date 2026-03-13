import { NextRequest, NextResponse } from 'next/server'

// Parse OpenBible.info topic HTML and extract verse refs + text
function parseOpenBibleHTML(html: string): Array<{ reference: string; text: string; votes: number }> {
  const results: Array<{ reference: string; text: string; votes: number }> = []

  // Extract verse blocks — pattern: h3 with reference, then ESV text and vote count
  const blockRegex = /<h3[^>]*>.*?search=([^&"]+)[^>]*>([^<]+)<\/a>.*?<\/h3>\s*<p[^>]*>\s*(?:ESV\s*\/\s*([\d,]+)\s*helpful votes?)?\s*([\s\S]*?)\s*<\/p>/gi
  let match

  while ((match = blockRegex.exec(html)) !== null) {
    const refRaw = decodeURIComponent(match[1]).replace(/\+/g, ' ')
    const refText = match[2]?.trim() || refRaw
    const votesStr = match[3]?.replace(/,/g, '') || '0'
    const verseText = match[4]
      ?.replace(/<[^>]+>/g, '') // strip any inner HTML
      .replace(/\s+/g, ' ')
      .trim() || ''

    if (refText && verseText) {
      results.push({
        reference: refText,
        text: verseText,
        votes: parseInt(votesStr, 10) || 0,
      })
    }
  }

  // Fallback: simpler regex if structure doesn't match exactly
  if (results.length === 0) {
    const simpleRef = /<h3[^>]*>[\s\S]*?([1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g
    const simpleText = /ESV[^<]*<\/p>\s*<p[^>]*>([\s\S]{20,300}?)<\/p>/g
    const refs: string[] = []
    const texts: string[] = []
    let m
    while ((m = simpleRef.exec(html)) !== null) refs.push(m[1].trim())
    while ((m = simpleText.exec(html)) !== null) texts.push(m[1].replace(/<[^>]+>/g, '').trim())
    for (let i = 0; i < Math.min(refs.length, texts.length, 20); i++) {
      results.push({ reference: refs[i], text: texts[i], votes: 0 })
    }
  }

  return results.slice(0, 25)
}

// Slugify a topic for OpenBible URL
function topicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
}

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json()
    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return NextResponse.json({ error: 'Topic required' }, { status: 400 })
    }

    const slug = topicSlug(topic.trim())
    const url = `https://www.openbible.info/topics/${slug}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FaithCompass/1.0 (faithcompass.app; Scripture reference tool)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return NextResponse.json({
        topic,
        slug,
        url,
        verses: [],
        message: `No results found for "${topic}". Try a simpler keyword like "prayer", "faith", or "love".`,
      })
    }

    const html = await response.text()
    const verses = parseOpenBibleHTML(html)

    // Extract canonical topic title from page
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
    const pageTitle = titleMatch?.[1]?.replace(/what does the bible say about/i, '').trim() || topic

    return NextResponse.json({
      topic: pageTitle,
      slug,
      url,
      verses,
      count: verses.length,
      source: 'openbible.info',
    })
  } catch (err) {
    console.error('Topics API error:', err)
    return NextResponse.json({ error: 'Failed to fetch topic results' }, { status: 500 })
  }
}
