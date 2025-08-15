import fs from 'fs/promises'
import path from 'path'

export type AdminSettings = {
  siteName: string
  supportEmail: string
  currency: string
  locale: string
  maintenanceMode: boolean
  updatedAt: string
}

const FILE_PATH = path.join(process.cwd(), 'public', 'admin-settings.json')

async function ensureFile() {
  try {
    await fs.access(FILE_PATH)
  } catch {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true })
    const defaults: AdminSettings = {
      siteName: 'Vidyut',
      supportEmail: 'support@example.com',
      currency: 'INR',
      locale: 'en-IN',
      maintenanceMode: false,
      updatedAt: new Date().toISOString(),
    }
    await fs.writeFile(FILE_PATH, JSON.stringify(defaults, null, 2), 'utf8')
  }
}

export async function readAdminSettings(): Promise<AdminSettings> {
  await ensureFile()
  const raw = await fs.readFile(FILE_PATH, 'utf8')
  try {
    const data = JSON.parse(raw) as AdminSettings
    return data
  } catch {
    return {
      siteName: 'Vidyut',
      supportEmail: 'support@example.com',
      currency: 'INR',
      locale: 'en-IN',
      maintenanceMode: false,
      updatedAt: new Date().toISOString(),
    }
  }
}

export async function writeAdminSettings(s: AdminSettings): Promise<void> {
  await ensureFile()
  await fs.writeFile(FILE_PATH, JSON.stringify(s, null, 2), 'utf8')
}


