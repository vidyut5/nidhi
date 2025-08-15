'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, ShieldCheck, Truck, Handshake } from 'lucide-react'

export default function EnterprisePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <Badge className="mb-3">For Businesses</Badge>
        <h1 className="text-4xl font-bold mb-3">Enterprise Solutions</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Streamline procurement with negotiated pricing, bulk ordering, consolidated invoicing, and dedicated support across India.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Verified Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            Work with vetted vendors and OEMs. Get compliance documents and QC on demand.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5" /> Negotiated Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            Contract rates for recurring SKUs and projects with approval workflows.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Logistics & SLA</CardTitle>
          </CardHeader>
          <CardContent>
            Multi-location delivery, shipment tracking, and agreed SLAs for critical items.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Centralized Billing</CardTitle>
          </CardHeader>
          <CardContent>
            Consolidated invoices, GST support, and credit terms for eligible partners.
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 text-center">
        <Button asChild size="lg">
          <Link href="/sell/dashboard">Request Enterprise Access</Link>
        </Button>
        <div className="mt-3 text-sm text-muted-foreground">No long forms. We’ll get back within 1 business day.</div>
      </div>
    </div>
  )
}



