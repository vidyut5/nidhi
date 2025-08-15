"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function Content() {
  const params = useSearchParams()
  const email = params?.get('email') || ''
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Vidyut</CardTitle>
          <CardDescription>Your account has been created. You can start shopping now, or become a seller.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>Signed up with: <span className="font-medium">{email}</span></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Button asChild variant="outline"><Link href="/">Start Shopping</Link></Button>
            <Button asChild><Link href="/sell/signup#kyc">Become a Seller</Link></Button>
          </div>
          <div className="text-xs text-muted-foreground">If you apply to become a seller, your store will be reviewed by our team. While pending, you can continue as a buyer.</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  )
}


