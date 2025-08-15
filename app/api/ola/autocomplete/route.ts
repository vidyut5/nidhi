import { NextResponse } from 'next/server'
import { getOlaAccessToken } from '@/lib/ola'

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query') || searchParams.get('q')
    if (!query || query.length < 1) {
      return NextResponse.json({ predictions: [] })
    }

    const apiKey = process.env.OLA_MAPS_API_KEY
    // Try API key header if token is not configured
    const token = await getOlaAccessToken()
    const url = `https://api.olamaps.io/v1/places/autocomplete?input=${encodeURIComponent(query)}`

    const upstream = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(apiKey && !token ? { 'X-API-KEY': apiKey } : {}),
      },
      next: { revalidate: 0 },
    })
    let data: any = null
    try {
      data = await upstream.json()
    } catch (parseErr) {
      console.error('ola autocomplete: failed to parse JSON', {
        status: upstream.status,
        statusText: upstream.statusText,
      })
      data = null
    }

    // Fallback mock predictions if upstream fails or returns 404/invalid
    if (!upstream.ok || !data || (!('predictions' in data) && !('results' in data))) {
      const mock = {
        predictions: [
          {
            description: `${query}, Karnataka, India`,
            structured_formatting: {
              main_text: `${query}`,
              secondary_text: 'Karnataka, India',
            },
          },
          {
            description: `${query} Market, India`,
            structured_formatting: {
              main_text: `${query} Market`,
              secondary_text: 'India',
            },
          },
        ],
      }
      const res = NextResponse.json(mock)
      res.headers.set('Cache-Control', 'no-store')
      return res
    }

    const res = NextResponse.json(data as Record<string, unknown>)
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (err) {
    console.error('ola autocomplete upstream error', err)
    const anyErr = err as any
    const upstreamStatus: number | undefined = anyErr?.status || anyErr?.response?.status
    const status: number = upstreamStatus && [401,403,429].includes(upstreamStatus) ? upstreamStatus : 500
    const message = status === 429 ? 'Rate limited' : status === 401 || status === 403 ? 'Unauthorized' : 'Server error'
    return NextResponse.json({ error: message, predictions: [] }, { status })
  }
}


