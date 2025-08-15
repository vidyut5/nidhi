"use client"

import { useEffect, useState } from 'react'

type Announcement = {
  id: string
  title: string
  body: string
  level: 'info' | 'warning' | 'danger' | 'success'
  audience: 'all' | 'buyers' | 'sellers'
}

export function AnnouncementPanel() {
  const [items, setItems] = useState<Announcement[]>([])
  useEffect(() => {
    fetch('/api/announcements', { cache: 'no-store' })
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]))
  }, [])
  if (!items.length) return null
  return (
    <div className="w-full">
      {items.map(a => (
        <div key={a.id} className={
          a.level === 'danger' ? 'bg-destructive/15 text-destructive px-3 py-2 text-sm' :
          a.level === 'warning' ? 'bg-amber-100 text-amber-900 px-3 py-2 text-sm' :
          a.level === 'success' ? 'bg-emerald-100 text-emerald-900 px-3 py-2 text-sm' :
          'bg-blue-100 text-blue-900 px-3 py-2 text-sm'
        }>
          <span className="font-medium mr-2">{a.title}</span>
          <span>{a.body}</span>
        </div>
      ))}
    </div>
  )
}


