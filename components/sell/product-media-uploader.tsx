"use client"

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

type FileMeta = { url: string; name?: string; type?: string; size?: number }

export function ProductMediaUploader({ inputName, defaultValue }: { inputName: string; defaultValue?: string }) {
  const initial = useMemo<FileMeta[]>(() => {
    try {
      return defaultValue ? JSON.parse(defaultValue) : []
    } catch {
      return []
    }
  }, [defaultValue])
  const [files, setFiles] = useState<FileMeta[]>(initial)
  const [uploading, setUploading] = useState(false)

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    const form = new FormData()
    for (const f of selected) form.append('files', f)
    try {
      setUploading(true)
      const res = await fetch('/api/uploads', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      const mapped: FileMeta[] = (data.files ?? [])
      setFiles(prev => [...prev, ...mapped])
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={inputName} value={files.length ? JSON.stringify(files) : ''} />
      <div className="flex items-center gap-3">
        <input type="file" multiple accept="image/*" onChange={onSelect} disabled={uploading} />
        <Button type="button" variant="outline" size="sm" onClick={() => setFiles([])} disabled={uploading}>Clear</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        {files.map((f, idx) => (
          <div key={idx} className="border rounded-md p-2 w-[160px]">
            <div className="h-[100px] w-full bg-muted/40 rounded flex items-center justify-center overflow-hidden">
              <Image src={f.url} alt={f.name || 'image'} width={150} height={100} className="object-cover h-full w-full" />
            </div>
            <a href={f.url} target="_blank" rel="noreferrer" className="block mt-2 truncate text-xs text-primary underline">
              {f.name || f.url}
            </a>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">Upload product images (PNG, JPG). Multiple files supported.</div>
    </div>
  )
}


