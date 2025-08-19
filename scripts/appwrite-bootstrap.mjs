import { Client, Databases, Storage, Teams, Permission, Role } from 'node-appwrite'

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
const teams = new Teams(client)

async function ensureDatabase() {
  try { await databases.get(DB_ID) } catch { await databases.create(DB_ID, DB_ID) }
}

async function ensureCollection(id, name, attributes) {
  let exists = false
  try {
    await databases.getCollection(DB_ID, id)
    exists = true
  } catch {
    await databases.createCollection(DB_ID, id, name, [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])
  }
  // Ensure attributes idempotently
  try {
    const list = await databases.listAttributes(DB_ID, id)
    const existingKeys = new Set((list?.attributes || []).map((a) => a.key).filter(Boolean))
    for (const a of attributes) {
      if (!existingKeys.has(a.key)) {
        try {
          await databases.createStringAttribute(DB_ID, id, a.key, a.size ?? 255, a.required ?? false)
        } catch (e) {
          // Skip if collection hit attribute cap or attribute exists in race
          console.warn(`attribute skip ${id}.${a.key}:`, e?.message || e)
        }
      }
    }
  } catch (e) {
    console.warn(`list/create attributes warning for ${id}:`, e?.message || e)
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

async function ensureTeam(id, name) {
  try { await teams.get(id) } catch { await teams.create(id, name) }
}

async function addIndexesForProducts() {
  try {
    await databases.createIndex(DB_ID, process.env.APPWRITE_COLLECTION_PRODUCTS || 'products', 'idx_products_lookup', 'key', ['slug', 'sellerId', 'categoryId'])
  } catch {}
}

async function main() {
  await ensureDatabase()
  await ensureTeam(process.env.APPWRITE_TEAM_ADMINS || 'admins', 'Admins')
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
  // Core marketplace collections (minimal attributes; extended later as needed)
  await ensureCollection(process.env.APPWRITE_COLLECTION_PRODUCTS || 'products', 'Products', [
    { key: 'name', size: 256, required: true },
    { key: 'slug', size: 256, required: true },
    { key: 'brand', size: 128 },
    { key: 'categoryId', size: 64 },
    { key: 'sellerId', size: 64 },
    { key: 'images', size: 12000 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_CATEGORIES || 'categories', 'Categories', [
    { key: 'name', size: 128, required: true },
    { key: 'slug', size: 128, required: true },
    { key: 'image', size: 512 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_SELLERS || 'sellers', 'Sellers', [
    { key: 'name', size: 256, required: true },
    { key: 'location', size: 256 },
    { key: 'avatarUrl', size: 512 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_ORDERS || 'orders', 'Orders', [
    { key: 'buyerId', size: 64, required: true },
    { key: 'sellerId', size: 64, required: true },
    { key: 'status', size: 32 },
    { key: 'total', size: 32 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_WISHLIST || 'wishlist', 'Wishlist', [
    { key: 'userId', size: 64, required: true },
    { key: 'productId', size: 64, required: true },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_REVIEWS || 'reviews', 'Reviews', [
    { key: 'productId', size: 64, required: true },
    { key: 'userId', size: 64, required: true },
    { key: 'rating', size: 8 },
    { key: 'comment', size: 2000 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_MESSAGES || 'messages', 'Messages', [
    { key: 'orderId', size: 64 },
    { key: 'senderId', size: 64 },
    { key: 'receiverId', size: 64 },
    { key: 'content', size: 4000 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_POSTS || 'posts', 'Posts', [
    { key: 'authorId', size: 64 },
    { key: 'title', size: 256 },
    { key: 'body', size: 12000 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_NOTIFICATIONS || 'notifications', 'Notifications', [
    { key: 'userId', size: 64 },
    { key: 'type', size: 64 },
    { key: 'payload', size: 16000 },
    { key: 'isRead', size: 8 },
  ])
  // State Info collections
  await ensureCollection(process.env.APPWRITE_COLLECTION_STATES || 'states', 'States', [
    { key: 'name', size: 64, required: true },
    { key: 'slug', size: 64, required: true },
    { key: 'profile', size: 16000 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_MANDALS || 'mandals', 'Mandals', [
    { key: 'stateSlug', size: 64, required: true },
    { key: 'name', size: 128, required: true },
    { key: 'profile', size: 16000 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_DISCOMS || 'discoms', 'DISCOMs', [
    { key: 'stateSlug', size: 64 },
    { key: 'name', size: 128, required: true },
    { key: 'profile', size: 16000 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_GENERATORS || 'generators', 'Generators', [
    { key: 'name', size: 128, required: true },
    { key: 'profile', size: 16000 },
  ])
  await ensureCollection(process.env.APPWRITE_COLLECTION_TRANSMISSIONS || 'transmissions', 'Transmissions', [
    { key: 'name', size: 128, required: true },
    { key: 'profile', size: 16000 },
  ])
  await ensureBucket()
  await addIndexesForProducts()
  console.log('Appwrite: database, collections and bucket are ready')
}

main().catch((e) => { console.error(e); process.exit(1) })
