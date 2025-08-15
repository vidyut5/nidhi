import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

type Lead = {
  id: string
  name: string
  logoUrl?: string
  sector?: string
  size?: 'SME' | 'Mid' | 'Large' | 'Enterprise'
  turnover?: string
  city?: string
  state?: string
  website?: string
  email?: string
  phone?: string
}

const leadsPath = path.join(process.cwd(), 'public', 'leads.json')

async function readLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(leadsPath, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data as Lead[] : []
  } catch {
    return []
  }
}

async function writeLeads(leads: Lead[]) {
  await fs.mkdir(path.dirname(leadsPath), { recursive: true })
  await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2))
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const size = (searchParams.get('size') || '').trim()
    const sector = (searchParams.get('sector') || '').trim().toLowerCase()
    const items = await readLeads()
    let out = items
    if (q) {
      out = out.filter(l => [l.name, l.sector, l.city, l.state]
        .some(v => (v || '').toLowerCase().includes(q)))
    }
    if (size && size !== 'all') out = out.filter(l => (l.size || '').toLowerCase() === size.toLowerCase())
    if (sector && sector !== 'all') out = out.filter(l => (l.sector || '').toLowerCase().includes(sector))
    return NextResponse.json(out.slice(0, 500))
  } catch (e) {
    console.error(e)
    return new NextResponse('Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    const list = Array.isArray(body) ? body : Array.isArray((body as any)?.leads) ? (body as any).leads : null
    if (!Array.isArray(list)) return NextResponse.json({ error: 'Expected an array of leads' }, { status: 400 })

    const normalized: Lead[] = list.map((raw: any) => {
      const name = typeof raw?.name === 'string' ? raw.name.trim() : ''
      const id = String(raw?.id || '') || (name ? name.toLowerCase().replace(/\s+/g, '-') : crypto.randomUUID())
      const coerceOpt = (v: any) => (typeof v === 'string' ? v : undefined)
      const size = coerceOpt(raw?.size) as Lead['size'] | undefined
      return {
        id,
        name,
        logoUrl: coerceOpt(raw?.logoUrl),
        sector: coerceOpt(raw?.sector),
        size,
        turnover: coerceOpt(raw?.turnover),
        city: coerceOpt(raw?.city),
        state: coerceOpt(raw?.state),
        website: coerceOpt(raw?.website),
        email: coerceOpt(raw?.email),
        phone: coerceOpt(raw?.phone),
      }
    }).filter(l => typeof l.name === 'string' && l.name.trim().length > 0)

    if (normalized.length === 0) {
      return NextResponse.json({ error: 'No valid leads. Each lead requires a non-empty name.' }, { status: 400 })
    }

    await writeLeads(normalized)
    return NextResponse.json({ ok: true, count: normalized.length })
  } catch (e) {
    console.error(e)
    return new NextResponse('Server Error', { status: 500 })
  }
}


