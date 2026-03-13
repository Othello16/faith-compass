import { NextRequest, NextResponse } from 'next/server'

// Free tier: Nominatim (OpenStreetMap) for geocoding + Overpass API for church search
// No API key, no billing required. Both are completely free and open.

function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip)}&country=us&format=json&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FaithCompass/1.0 (faithcompass.app)' },
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&countrycodes=us`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FaithCompass/1.0 (faithcompass.app)' },
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

interface OverpassElement {
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

async function findChurchesNearby(
  lat: number,
  lng: number,
  radiusMeters: number,
  denomination?: string
): Promise<OverpassElement[]> {
  // Overpass QL query: find all amenity=place_of_worship within radius
  let denominationFilter = ''
  if (denomination && denomination !== 'all') {
    denominationFilter = `["denomination"="${denomination}"]`
  }

  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="place_of_worship"]["religion"="christian"]${denominationFilter}(around:${radiusMeters},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="christian"]${denominationFilter}(around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(15000),
  })

  const data = await res.json()
  return (data.elements || []) as OverpassElement[]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zip = searchParams.get('zip')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const city = searchParams.get('city')
    const denomination = searchParams.get('denomination') || undefined

    let locationLat: number
    let locationLng: number

    if (lat && lng) {
      locationLat = parseFloat(lat)
      locationLng = parseFloat(lng)
    } else if (zip?.trim()) {
      const geo = await geocodeZip(zip.trim())
      if (!geo) return NextResponse.json({ error: 'Zip code not found' }, { status: 400 })
      locationLat = geo.lat
      locationLng = geo.lng
    } else if (city?.trim()) {
      const geo = await geocodeCity(city.trim())
      if (!geo) return NextResponse.json({ error: 'City not found' }, { status: 400 })
      locationLat = geo.lat
      locationLng = geo.lng
    } else {
      return NextResponse.json({ error: 'Zip code, city, or coordinates required' }, { status: 400 })
    }

    // 8047m = 5 miles
    const elements = await findChurchesNearby(locationLat, locationLng, 8047, denomination)

    const churches = elements
      .map((el) => {
        const elLat = el.lat ?? el.center?.lat
        const elLng = el.lon ?? el.center?.lon
        const distance = elLat && elLng
          ? Math.round(getDistanceMiles(locationLat, locationLng, elLat, elLng) * 10) / 10
          : null

        const tags = el.tags || {}
        const name = tags.name || tags['name:en'] || 'Church'
        const address = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:city'],
          tags['addr:state'],
        ].filter(Boolean).join(' ') || tags['addr:full'] || ''

        return {
          id: String(el.id),
          name,
          address,
          denomination: tags.denomination || tags.religion || null,
          website: tags.website || tags['contact:website'] || null,
          phone: tags.phone || tags['contact:phone'] || null,
          openNow: null,
          rating: null,
          location: elLat && elLng ? { lat: elLat, lng: elLng } : null,
          distance,
          source: 'openstreetmap',
        }
      })
      .filter(c => c.name !== 'Church' || c.address)  // filter unnamed/no-address
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
      .slice(0, 15)

    return NextResponse.json({
      churches,
      total: churches.length,
      center: { lat: locationLat, lng: locationLng },
      source: 'OpenStreetMap + Overpass API',
    })
  } catch (err) {
    console.error('Churches API error:', err)
    return NextResponse.json({ error: 'Failed to search churches' }, { status: 500 })
  }
}
