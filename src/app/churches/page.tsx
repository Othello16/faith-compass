'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

interface Church {
  id: string
  name: string
  address: string
  rating?: number
  totalRatings?: number
  openNow?: boolean
  location?: { lat: number; lng: number }
  distance?: number | null
  photoReference?: string
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
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')

  const searchWithCoords = useCallback(async (lat: number, lng: number, denom: string) => {
    setLoading(true)
    setError('')
    setChurches([])
    setSearched(true)
    try {
      const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() })
      if (denom && denom !== 'All Denominations') {
        params.set('denomination', denom)
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
  }, [])

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    setLocationStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('granted')
        searchWithCoords(position.coords.latitude, position.coords.longitude, denomination)
      },
      () => {
        setLocationStatus('denied')
        setError('Location access denied. Please enter a zip code instead.')
      }
    )
  }, [denomination, searchWithCoords])

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
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Trusted Church Finder</h1>
        <p className="text-white/50 text-sm mb-8">
          Find real congregations near you. Real churches. Real community. Real accountability.
        </p>

        {/* Location prompt */}
        {locationStatus === 'idle' && (
          <div className="bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-2xl p-6 mb-6 text-center">
            <p className="text-white/70 text-sm mb-3">
              We use your location to find churches near you. We do not store this.
            </p>
            <button
              onClick={useMyLocation}
              className="bg-[#1E40AF] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Use My Location
            </button>
            <p className="text-white/30 text-xs mt-3">Or enter a zip code below</p>
          </div>
        )}

        {locationStatus === 'requesting' && (
          <div className="bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-2xl p-6 mb-6 text-center">
            <p className="text-white/70 text-sm">Requesting location access...</p>
          </div>
        )}

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

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {churches.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-white/40">{churches.length} churches found nearby</p>
            <div className="grid md:grid-cols-2 gap-4">
              {churches.map((church) => (
                <div key={church.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#1E40AF]/50 transition">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">{church.name}</h3>
                  <p className="text-white/60 text-sm mb-3">{church.address}</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {church.distance != null && (
                      <span className="bg-white/10 px-2 py-1 rounded-full text-white/70">
                        {church.distance} mi
                      </span>
                    )}
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

        {searched && !loading && churches.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">No churches found in this area. Try a different zip code or denomination.</p>
          </div>
        )}

        {!searched && locationStatus !== 'idle' && !loading && (
          <div className="text-center py-12 text-white/30 text-sm">
            <p>Enter your zip code to find churches near you.</p>
          </div>
        )}
      </div>
    </main>
  )
}
