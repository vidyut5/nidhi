"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSellerLeadsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/sell/leads')
  }, [router])
  return <p className="p-4 text-sm text-muted-foreground">Redirecting to Seller Leads…</p>
}


