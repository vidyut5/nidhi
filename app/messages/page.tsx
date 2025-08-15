"use client"

import { ChatInbox } from '@/components/messages/chat-inbox'
import { useEffect } from 'react'

export default function MessagesPage() {
  useEffect(() => {
    fetch('/api/messages/seed', { method: 'POST' }).catch(() => {})
  }, [])
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <ChatInbox />
    </div>
  )
}


