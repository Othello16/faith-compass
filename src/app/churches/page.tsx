'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Church {
  id: string
  name: string
  address: string
  rating?: number
  totalRatings?: number
  openNow?: boolean
  location?: { lat: number; lng: number }
}

const DENOMINATIONS = [
  'All Denominations',
  'Baptist',
  'Catholic',
  'Methodist',
  'Pentecostal',
  'Presbyterian',
  'Lutheran',
  'Episcopal',
  'Non-Denominational',
  'Church of God',
  'AME',
  'Seventh-day Adventist',
]

export default function ChurchesPage() {
  const [zip, setZip] = useState('')
  const [denomination, setDenomination] = useState('')
  const [churches, setChurches] = useState<Church[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const searchChurches = async () => {
    if (!zip.trim() || loading) return
    setLoading(true)
    setError('')
    setChurches([])
    setSearched(true)
    try {
      const params = new URLSearchParams({ zip: zip.trim() })
      if (denomination && denomination !== 'All Denominations') {
        params.set('denomination', denomination)
      }
      const res = await fetch(`/api/churches?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setChurches(data.churches || [])
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
          <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Trusted Church Finder</h1>
        <p className="text-white/50 text-sm mb-8">
          Find real congregations near you. Real churches. Real community. Real accountability.
        </p>

        {/* Search */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs text-white/40 block mb-1">Zip Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Enter zip code"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#1E40AF]/50 transition"
                onKeyDown={(e) => e.key === 'Enter' && searchChurches()}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-white/40 block mb-1">Denomination</label>
              <select
                value={denomination}
                onChange={(e) => setDenomination(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#1E40AF]/50 transition appearance-none"
              >
                {DENOMINATIONS.map((d) => (
                  <option key={d} value={d} className="bg-[#0F172A]">{d}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={searchChurches}
                disabled={!zip.trim() || loading}
                className="bg-[#1E40AF] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Searching...' : 'Find Churches'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {churches.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-white/40">{churches.length} churches found near {zip}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {churches.map((church) => (
                <div key={church.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#1E40AF]/50 transition">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">{church.name}</h3>
                  <p className="text-white/60 text-sm mb-3">{church.address}</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {church.rating && (
                      <span className="bg-white/10 px-2 py-1 rounded-full text-white/70">
                        ★ {church.rating} ({church.totalRatings} reviews)
                      </span>
                    )}
                    {church.openNow !== undefined && (
                      <span className={`px-2 py-1 rounded-full ${church.openNow ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/50'}`}>
                        {church.openNow ? 'Open Now' : 'Closed'}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${church.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1E40AF] hover:text-blue-400 transition"
                    >
                      View on Map →
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(church.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/50 hover:text-white transition"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {searched && !loading && churches.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">No churches found in this area. Try a different zip code or denomination.</p>
          </div>
        )}

        {/* Info */}
        {!searched && (
          <div className="text-center py-12 text-white/30 text-sm">
            <p>Enter your zip code to find churches near you.</p>
            <p className="mt-2">Results powered by Google Places. Ratings from Phase 2.</p>
          </div>
        )}
      </div>
    </main>
  )
}
