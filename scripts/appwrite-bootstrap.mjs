import { Client, Databases, Storage, Permission, Role } from 'node-appwrite'

const endpoint = process.env.APPWRITE_ENDPOINT
const projectId = process.env.APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
if (!endpoint || !projectId || !apiKey) {
  console.error('Missing APPWRITE env')
  process.exit(1)
}

const DB_ID = process.env.APPWRITE_DATABASE_ID || 'vidyut_db'
const COL_LEADS = process.env.APPWRITE_COLLECTION_LEADS || 'leads'
const COL_GUIDELINES = process.env.APPWRITE_COLLECTION_GUIDELINES || 'guidelines'
const BUCKET_UPLOADS = process.env.APPWRITE_BUCKET_UPLOADS || 'uploads'

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
const databases = new Databases(client)
const storage = new Storage(client)

async function ensureDatabase() {
  try { await databases.get(DB_ID) } catch { await databases.create(DB_ID, DB_ID) }
}

async function ensureCollection(id, name, attributes) {
  try {
    await databases.getCollection(DB_ID, id)
  } catch {
    await databases.createCollection(DB_ID, id, name, [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])
    for (const a of attributes) {
      await databases.createStringAttribute(DB_ID, id, a.key, a.size ?? 255, a.required ?? false)
    }
  }
}

async function ensureBucket() {
  try { await storage.getBucket(BUCKET_UPLOADS) } catch {
    await storage.createBucket(BUCKET_UPLOADS, BUCKET_UPLOADS, [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ], true)
  }
}

async function main() {
  await ensureDatabase()
  await ensureCollection(COL_LEADS, 'Leads', [
    { key: 'name', size: 256, required: true },
    { key: 'logoUrl', size: 512 },
    { key: 'sector', size: 128 },
    { key: 'size', size: 32 },
    { key: 'turnover', size: 64 },
    { key: 'city', size: 64 },
    { key: 'state', size: 64 },
    { key: 'website', size: 512 },
    { key: 'email', size: 256 },
    { key: 'phone', size: 64 },
  ])
  await ensureCollection(COL_GUIDELINES, 'Guidelines', [
    { key: 'title', size: 256, required: true },
    { key: 'content', size: 10000 },
    { key: 'state', size: 64 },
    { key: 'city', size: 64 },
    { key: 'category', size: 64 },
    { key: 'attachments', size: 16000 },
    { key: 'isActive', size: 8 },
  ])
  await ensureBucket()
  console.log('Appwrite: database, collections and bucket are ready')
}

main().catch((e) => { console.error(e); process.exit(1) })
