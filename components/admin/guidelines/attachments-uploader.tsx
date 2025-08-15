"use client"

import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

export function AttachmentsUploader({ onChange, inputName, defaultValue }: { onChange?: (files: { url: string; name?: string; type?: string; size?: number }[]) => void; inputName?: string; defaultValue?: string }) {
  return (
    <UploadButton<OurFileRouter, never>
      className="ut-button"
      endpoint={{
        route: 'guidelineAttachment',
      } as any}
      input={undefined as never}
      onClientUploadComplete={(res: Array<{ url: string; name: string; type: string; size: number }> | undefined) => {
        const mapped = (res ?? []).map((f) => ({ url: f.url, name: f.name, type: f.type, size: f.size }))
        onChange?.(mapped)
      }}
      onUploadError={(e: unknown) => console.error(e)}
    />
  )
}


