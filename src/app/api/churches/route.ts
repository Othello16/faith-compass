import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zip = searchParams.get('zip')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const denomination = searchParams.get('denomination')

    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
    }

    let locationLat: number
    let locationLng: number

    if (lat && lng) {
      locationLat = parseFloat(lat)
      locationLng = parseFloat(lng)
    } else if (zip?.trim()) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&key=${GOOGLE_PLACES_API_KEY}`
      const geoRes = await fetch(geocodeUrl)
      const geoData = await geoRes.json()
      if (!geoData.results?.length) {
        return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 })
      }
      locationLat = geoData.results[0].geometry.location.lat
      locationLng = geoData.results[0].geometry.location.lng
    } else {
      return NextResponse.json({ error: 'Zip code or coordinates required' }, { status: 400 })
    }

    let keyword = 'church'
    if (denomination) {
      keyword = `${denomination} church`
    }

    // 8047m = 5 miles
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${locationLat},${locationLng}&radius=8047&type=church&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_PLACES_API_KEY}`
    const placesRes = await fetch(placesUrl)
    const placesData = await placesRes.json()

    const churches = (placesData.results || []).slice(0, 10).map((place: Record<string, unknown>) => {
      const placeLocation = (place.geometry as Record<string, unknown>)?.location as { lat: number; lng: number }
      const distance = placeLocation
        ? getDistanceMiles(locationLat, locationLng, placeLocation.lat, placeLocation.lng)
        : null

      return {
        id: place.place_id as string,
        name: place.name as string,
        address: place.vicinity as string,
        rating: place.rating as number | undefined,
        totalRatings: place.user_ratings_total as number | undefined,
        openNow: (place.opening_hours as Record<string, unknown>)?.open_now as boolean | undefined,
        location: placeLocation,
        distance: distance ? Math.round(distance * 10) / 10 : null,
        website: null,
        photoReference: (place.photos as Array<Record<string, unknown>>)?.[0]?.photo_reference as string | undefined,
      }
    })

    // Sort by distance
    churches.sort((a: { distance: number | null }, b: { distance: number | null }) =>
      (a.distance ?? 999) - (b.distance ?? 999)
    )

    return NextResponse.json({
      churches,
      total: churches.length,
      center: { lat: locationLat, lng: locationLng },
    })
  } catch (err) {
    console.error('Churches API error:', err)
    return NextResponse.json({ error: 'Failed to search churches' }, { status: 500 })
  }
}

function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
