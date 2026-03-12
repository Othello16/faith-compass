import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zip = searchParams.get('zip')
    const denomination = searchParams.get('denomination')

    if (!zip?.trim()) {
      return NextResponse.json({ error: 'Zip code is required' }, { status: 400 })
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
    }

    // Geocode zip code to lat/lng
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&key=${GOOGLE_PLACES_API_KEY}`
    const geoRes = await fetch(geocodeUrl)
    const geoData = await geoRes.json()

    if (!geoData.results?.length) {
      return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 })
    }

    const { lat, lng } = geoData.results[0].geometry.location

    // Search for churches nearby
    let keyword = 'church'
    if (denomination) {
      keyword = `${denomination} church`
    }

    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=16093&type=church&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_PLACES_API_KEY}`
    const placesRes = await fetch(placesUrl)
    const placesData = await placesRes.json()

    const churches = (placesData.results || []).slice(0, 20).map((place: Record<string, unknown>) => ({
      id: place.place_id as string,
      name: place.name as string,
      address: place.vicinity as string,
      rating: place.rating as number | undefined,
      totalRatings: place.user_ratings_total as number | undefined,
      openNow: (place.opening_hours as Record<string, unknown>)?.open_now as boolean | undefined,
      location: (place.geometry as Record<string, unknown>)?.location as { lat: number; lng: number },
    }))

    return NextResponse.json({ churches, total: churches.length })
  } catch (err) {
    console.error('Churches API error:', err)
    return NextResponse.json({ error: 'Failed to search churches' }, { status: 500 })
  }
}
