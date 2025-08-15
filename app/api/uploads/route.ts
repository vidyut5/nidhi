export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {}
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const files: File[] = []
    const fields = ['file', 'files']
    for (const field of fields) {
      const value = form.getAll(field)
      for (const v of value) {
        if (v instanceof File) files.push(v)
      }
    }
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validation constraints
    const MAX_FILES = 5
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB per file
    const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'application/pdf'])
    const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.pdf'])

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Too many files. Max ${MAX_FILES}.` }, { status: 413 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await ensureDir(uploadDir)

    const saved = await Promise.all(files.map(async (file) => {
      if (file.size > MAX_SIZE) {
        throw Object.assign(new Error(`File too large: ${file.name}`), { statusCode: 413 })
      }
      const ext = path.extname(file.name || '').toLowerCase()
      const type = String(file.type || '')
      if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(type)) {
        throw Object.assign(new Error(`Unsupported file type: ${file.name}`), { statusCode: 415 })
      }
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      // crude magic bytes check for images/pdf
      const magic = buffer.subarray(0, 4).toString('hex')
      const looksJpeg = magic.startsWith('ffd8')
      const looksPng = magic === '89504e47'
      const looksPdf = buffer.subarray(0, 5).toString() === '%PDF-'
      if ((type === 'image/jpeg' && !looksJpeg) || (type === 'image/png' && !looksPng) || (type === 'application/pdf' && !looksPdf)) {
        throw Object.assign(new Error(`File content does not match type: ${file.name}`), { statusCode: 415 })
      }
      const safeBase = 'file'
      const random = crypto.randomBytes(8).toString('hex')
      const filename = `${safeBase}_${random}${ext}`
      const filepath = path.join(uploadDir, filename)
      await fs.writeFile(filepath, buffer)
      const url = `/uploads/${filename}`
      return { url, name: path.basename(file.name), type, size: file.size }
    }))

    return NextResponse.json({ files: saved })
  } catch (err) {
    console.error('Upload error', err)
    const status = (err as any)?.statusCode || 500
    const message = status === 413 ? 'Payload too large' : status === 415 ? 'Unsupported media type' : 'Upload failed'
    return NextResponse.json({ error: message }, { status })
  }
}


