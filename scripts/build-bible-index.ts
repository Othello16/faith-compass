/**
 * Build Bible Index
 *
 * Downloads KJV Bible JSON and creates:
 * 1. kjv-index.json — flat array of all verses
 * 2. Individual chapter files in chapters/ directory
 *
 * Usage: npx tsx scripts/build-bible-index.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

const BIBLE_URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'bible')
const CHAPTERS_DIR = path.join(OUTPUT_DIR, 'chapters')

const BOOK_ABBREVS: Record<number, string> = {
  1: 'GEN', 2: 'EXO', 3: 'LEV', 4: 'NUM', 5: 'DEU',
  6: 'JOS', 7: 'JDG', 8: 'RUT', 9: '1SA', 10: '2SA',
  11: '1KI', 12: '2KI', 13: '1CH', 14: '2CH', 15: 'EZR',
  16: 'NEH', 17: 'EST', 18: 'JOB', 19: 'PSA', 20: 'PRO',
  21: 'ECC', 22: 'SNG', 23: 'ISA', 24: 'JER', 25: 'LAM',
  26: 'EZK', 27: 'DAN', 28: 'HOS', 29: 'JOL', 30: 'AMO',
  31: 'OBA', 32: 'JON', 33: 'MIC', 34: 'NAH', 35: 'HAB',
  36: 'ZEP', 37: 'HAG', 38: 'ZEC', 39: 'MAL',
  40: 'MAT', 41: 'MRK', 42: 'LUK', 43: 'JHN', 44: 'ACT',
  45: 'ROM', 46: '1CO', 47: '2CO', 48: 'GAL', 49: 'EPH',
  50: 'PHP', 51: 'COL', 52: '1TH', 53: '2TH', 54: '1TI',
  55: '2TI', 56: 'TIT', 57: 'PHM', 58: 'HEB', 59: 'JAS',
  60: '1PE', 61: '2PE', 62: '1JN', 63: '2JN', 64: '3JN',
  65: 'JUD', 66: 'REV',
}

const BOOK_NAMES: Record<number, string> = {
  1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
  6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
  16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
  21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
  26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
  31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
  36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi',
  40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts',
  45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians',
  50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy',
  55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James',
  60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John',
  65: 'Jude', 66: 'Revelation',
}

interface Verse {
  id: string
  book: string
  bookNum: number
  bookAbbrev: string
  chapter: number
  verse: number
  text: string
  hash: string
}

async function main() {
  console.log('Downloading KJV Bible...')
  const res = await fetch(BIBLE_URL)
  const bibleData = await res.json()

  // Ensure output directories exist
  fs.mkdirSync(CHAPTERS_DIR, { recursive: true })

  const allVerses: Verse[] = []
  const chapterFiles: Record<string, Verse[]> = {}

  for (let bookIdx = 0; bookIdx < bibleData.length; bookIdx++) {
    const bookData = bibleData[bookIdx]
    const bookNum = bookIdx + 1
    const bookName = BOOK_NAMES[bookNum] || bookData.name || `Book ${bookNum}`
    const bookAbbrev = BOOK_ABBREVS[bookNum] || `B${bookNum}`
    const chapters = bookData.chapters || []

    for (let chIdx = 0; chIdx < chapters.length; chIdx++) {
      const chapterNum = chIdx + 1
      const verses = chapters[chIdx]
      const chapterKey = `${bookAbbrev}-${chapterNum}`
      const chapterVerses: Verse[] = []

      for (let vIdx = 0; vIdx < verses.length; vIdx++) {
        const verseNum = vIdx + 1
        const text = verses[vIdx].toString().trim()
        if (!text) continue

        const id = `${bookAbbrev}.${chapterNum}.${verseNum}`
        const hash = crypto.createHash('sha256').update(text).digest('hex')

        const verse: Verse = {
          id,
          book: bookName,
          bookNum,
          bookAbbrev,
          chapter: chapterNum,
          verse: verseNum,
          text,
          hash,
        }

        allVerses.push(verse)
        chapterVerses.push(verse)
      }

      chapterFiles[chapterKey] = chapterVerses
    }
  }

  // Write main index
  const indexPath = path.join(OUTPUT_DIR, 'kjv-index.json')
  fs.writeFileSync(indexPath, JSON.stringify(allVerses))
  console.log(`Written ${allVerses.length} verses to kjv-index.json`)

  // Write individual chapter files
  let chapterCount = 0
  for (const [key, verses] of Object.entries(chapterFiles)) {
    const chapterPath = path.join(CHAPTERS_DIR, `${key}.json`)
    fs.writeFileSync(chapterPath, JSON.stringify(verses, null, 2))
    chapterCount++
  }
  console.log(`Written ${chapterCount} chapter files`)

  // Write book metadata
  const books = Object.entries(BOOK_NAMES).map(([num, name]) => ({
    bookNum: parseInt(num),
    name,
    abbrev: BOOK_ABBREVS[parseInt(num)],
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    chapters: bibleData[parseInt(num) - 1]?.chapters?.length || 0,
  }))
  fs.writeFileSync(path.join(OUTPUT_DIR, 'books.json'), JSON.stringify(books, null, 2))
  console.log(`Written books.json with ${books.length} books`)

  console.log('Bible index build complete!')
}

main().catch(console.error)
