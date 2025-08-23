import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from '@/lib/logger';

// Allowed file types for security
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB

// File type validation
function isValidFileType(file: { type: string }, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

// File size validation
function isValidFileSize(file: { size: number }, maxSize: number): boolean {
  return file.size <= maxSize
}

// File name validation (prevent path traversal attacks)
function isValidFileName(fileName: string): boolean {
  const dangerousPatterns = [
    /\.\./, // Path traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(fileName))
}

async function verifyAdminCookieFromRequest(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|; )admin_session=([^;]+)/)
    const token = match ? decodeURIComponent(match[1]) : ''
    const secret = process.env.ADMIN_SESSION_SECRET || ''
    if (!token || !secret) return null
    const [h, p, s] = token.split('.')
    if (!h || !p || !s) return null
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const data = `${h}.${p}`
    const sig = new Uint8Array(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64'))
    const ok = await crypto.subtle.verify('HMAC', key, sig, enc.encode(data))
    if (!ok) return null
    const payloadJson = Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const payload = JSON.parse(payloadJson) as { exp?: number; sub?: string; subId?: string }
    if (typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000)
      if (now >= payload.exp) return null
    }
    return payload.subId || payload.sub || 'admin'
  } catch {
    return null
  }
}

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route slug
  productImage: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 10
    } 
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // Allow either authenticated user via next-auth or an active admin session
      const adminId = await verifyAdminCookieFromRequest(req as unknown as Request)
      if (adminId) return { userId: adminId }
      const session = await getServerSession(authOptions);
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const userId = typeof metadata?.userId === 'string' ? metadata.userId : ''
        if (!userId) {
          throw new Error('Missing or invalid userId in upload metadata')
        }
        
        // Additional security checks
        if (!isValidFileType(file, ALLOWED_IMAGE_TYPES)) {
          throw new Error('Invalid file type for product image')
        }
        
        if (!isValidFileSize(file, MAX_FILE_SIZE)) {
          throw new Error('File size exceeds limit')
        }
        
        if (!isValidFileName(file.name)) {
          throw new Error('Invalid file name')
        }
        
        // Optionally persist a reference in DB here
        // await prisma.asset.create({ data: { userId, url: file.url } })
        logger.info('Product image upload completed', { userId, fileId: file.key, fileName: file.name, fileSize: file.size })
      } catch (err) {
        logger.error('Product image upload failed', err instanceof Error ? err : undefined, { fileId: file.key, fileName: file.name })
        throw err
      }
    }),
    
  guidelineAttachment: f({ 
    image: { maxFileSize: "8MB" }, 
    blob: { maxFileSize: "8MB" } 
  })
    .middleware(async ({ req }) => {
      const adminId = await verifyAdminCookieFromRequest(req as unknown as Request)
      if (adminId) return { userId: adminId }
      const session = await getServerSession(authOptions);
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const userId = typeof metadata?.userId === 'string' ? metadata.userId : ''
        if (!userId) throw new Error('Missing or invalid userId in upload metadata')
        
        // Additional security checks for guideline attachments
        const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]
        if (!isValidFileType(file, allowedTypes)) {
          throw new Error('Invalid file type for guideline attachment')
        }
        
        if (!isValidFileSize(file, MAX_FILE_SIZE)) {
          throw new Error('File size exceeds limit')
        }
        
        if (!isValidFileName(file.name)) {
          throw new Error('Invalid file name')
        }
        
        logger.info('Guideline attachment upload completed', { userId, fileId: file.key, fileName: file.name, fileSize: file.size })
      } catch (err) {
        logger.error('Guideline attachment upload failed', err instanceof Error ? err : undefined, { fileId: file.key, fileName: file.name })
        throw err
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
