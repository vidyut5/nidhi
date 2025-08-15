import { getAppwrite } from '@/lib/appwrite'
import { APPWRITE_BUCKET_UPLOADS, APPWRITE_COLLECTION_GUIDELINES, APPWRITE_COLLECTION_LEADS, APPWRITE_DATABASE_ID } from '@/lib/appwrite-ids'
import { ID, Permission, Role } from 'node-appwrite'

async function main() {
  const { databases, storage } = getAppwrite()

  // Database
  try {
    await databases.get(APPWRITE_DATABASE_ID)
  } catch {
    await databases.create(APPWRITE_DATABASE_ID, APPWRITE_DATABASE_ID)
  }

  // Collections
  const ensureCollection = async (id: string, name: string, attrs: any[]) => {
    try { await databases.getCollection(APPWRITE_DATABASE_ID, id) } catch {
      await databases.createCollection(APPWRITE_DATABASE_ID, id, name, [
        Permission.read(Role.any()),
        Permission.create(Role.team('admins')), // adjust later
        Permission.update(Role.team('admins')),
        Permission.delete(Role.team('admins')),
      ])
      for (const a of attrs) {
        await databases.createStringAttribute(APPWRITE_DATABASE_ID, id, a.key, a.size ?? 255, a.required ?? false)
      }
    }
  }

  await ensureCollection(APPWRITE_COLLECTION_LEADS, 'Leads', [
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

  await ensureCollection(APPWRITE_COLLECTION_GUIDELINES, 'Guidelines', [
    { key: 'title', size: 256, required: true },
    { key: 'content', size: 10000 },
    { key: 'state', size: 64 },
    { key: 'city', size: 64 },
    { key: 'category', size: 64 },
    { key: 'attachments', size: 16000 },
    { key: 'isActive', size: 8 },
  ])

  // Buckets
  try { await storage.getBucket(APPWRITE_BUCKET_UPLOADS) } catch {
    await storage.createBucket(APPWRITE_BUCKET_UPLOADS, APPWRITE_BUCKET_UPLOADS, [
      Permission.read(Role.any()),
      Permission.create(Role.user('current')),
      Permission.update(Role.user('current')),
      Permission.delete(Role.user('current')),
    ], true)
  }

  console.log('Appwrite bootstrap complete')
}

main().catch((e) => { console.error(e); process.exit(1) })


