import { NextRequest, NextResponse } from 'next/server'

function parseOpenBibleHTML(html: string): Array<{ reference: string; text: string; votes: number }> {
  const results: Array<{ reference: string; text: string; votes: number }> = []

  // Each verse is wrapped in <div class="verse">...</div>
  // Inside: <a class="bibleref">REF</a>, <span class="note">ESV / N helpful votes</span>, <p>TEXT</p>
  const verseBlockRegex = /<div class="verse">([\s\S]*?)<\/div>/gi
  let block: RegExpExecArray | null

  while ((block = verseBlockRegex.exec(html)) !== null) {
    const inner = block[1]

    // Reference: text inside <a class="bibleref">
    const refMatch = inner.match(/<a[^>]*class="bibleref"[^>]*>([^<]+)<\/a>/)
    const reference = refMatch?.[1]?.trim() || ''

    // Votes: from <span class="note">ESV / 4,238 helpful votes</span>
    const noteMatch = inner.match(/<span class="note">\s*([\s\S]*?)\s*<\/span>/)
    const noteText = noteMatch?.[1]?.trim() || ''
    const votesMatch = noteText.match(/([\d,]+)\s+helpful/)
    const votes = parseInt((votesMatch?.[1] || '0').replace(/,/g, ''), 10)

    // Verse text: inside <p>...</p> after the h3
    const pMatch = inner.match(/<\/h3>\s*<p>\s*([\s\S]*?)\s*<\/p>/)
    const rawText = pMatch?.[1] || ''
    // Decode HTML entities and clean up
    const text = rawText
      .replace(/&#8220;/g, '\u201C')
      .replace(/&#8221;/g, '\u201D')
      .replace(/&#8216;/g, '\u2018')
      .replace(/&#8217;/g, '\u2019')
      .replace(/&#8211;/g, '\u2013')
      .replace(/&#8212;/g, '\u2014')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (reference && text) {
      results.push({ reference, text, votes })
    }
  }

  return results.slice(0, 25)
}

function topicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/what does the bible say about/i, '')
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
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json({
        topic: topic.trim(),
        slug,
        url,
        verses: [],
        count: 0,
        message: `No results found for "${topic}". Try a simpler keyword like "prayer", "faith", or "love".`,
      })
    }

    const html = await response.text()
    const verses = parseOpenBibleHTML(html)

    // Extract page title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    const pageTitle = titleMatch?.[1]
      ?.replace(/what does the bible say about/i, '')
      .replace(/\?.*/, '')
      .replace(/Faith Compass.*/, '')
      .trim() || topic.trim()

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
