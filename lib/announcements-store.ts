import fs from 'fs/promises'
import path from 'path'

export type Announcement = {
  id: string
  title: string
  body: string
  level: 'info' | 'warning' | 'danger' | 'success'
  audience: 'all' | 'buyers' | 'sellers'
  isActive: boolean
  startsAt?: string
  endsAt?: string
  createdAt: string
  updatedAt: string
}

const FILE_PATH = path.join(process.cwd(), 'public', 'announcements.json')

async function ensureFile() {
  try {
    await fs.access(FILE_PATH)
  } catch {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true })
    await fs.writeFile(FILE_PATH, '[]', 'utf8')
  }
}

export async function readAnnouncements(): Promise<Announcement[]> {
  await ensureFile()
  const raw = await fs.readFile(FILE_PATH, 'utf8')
  try {
    const data = JSON.parse(raw) as Announcement[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function writeAnnouncements(list: Announcement[]): Promise<void> {
  await ensureFile()
  await fs.writeFile(FILE_PATH, JSON.stringify(list, null, 2), 'utf8')
}

export async function upsertAnnouncement(input: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const now = new Date().toISOString()
  const list = await readAnnouncements()
  if (input.id) {
    const idx = list.findIndex(a => a.id === input.id)
    if (idx !== -1) {
      const updated: Announcement = {
        ...list[idx],
        title: input.title,
        body: input.body,
        level: input.level,
        audience: input.audience,
        isActive: input.isActive,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        id: input.id,
        updatedAt: now,
        createdAt: list[idx].createdAt,
      }
      list[idx] = updated
    } else {
      const created: Announcement = {
        id: input.id,
        title: input.title,
        body: input.body,
        level: input.level,
        audience: input.audience,
        isActive: input.isActive,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        createdAt: now,
        updatedAt: now,
      }
      list.push(created)
    }
  } else {
    const id = randomId()
    const created: Announcement = {
      id,
      title: input.title,
      body: input.body,
      level: input.level,
      audience: input.audience,
      isActive: input.isActive,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      createdAt: now,
      updatedAt: now,
    }
    list.push(created)
  }
  await writeAnnouncements(list)
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const list = await readAnnouncements()
  const initialLength = list.length
  const next = list.filter(a => a.id !== id)
  if (next.length === initialLength) return false
  await writeAnnouncements(next)
  return true
}

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}


