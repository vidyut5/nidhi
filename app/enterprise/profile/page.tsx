"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Building2, Users, Shield, FileCheck2, CreditCard, MapPin, Mail, Phone } from 'lucide-react'

const enterprise = {
  companyName: 'Vidyut Industries Pvt. Ltd.',
  domain: 'vidyut.co',
  gst: '27ABCDE1234F1Z5',
  cin: 'U12345MH2020PTC000000',
  address: 'Corporate Park, Andheri East, Mumbai, 400093',
  billingAddress: 'Accounts Dept, Corporate Park, Andheri East, Mumbai, 400093',
  contacts: { email: 'procurement@vidyut.co', phone: '+91 99887 66554' },
  poTerms: {
    requiresApproval: true,
    minOrderValue: 10000,
    creditDays: 30,
    allowedPaymentMethods: ['NEFT/RTGS', 'UPI', 'NetBanking'],
  },
  costCenters: [
    { id: 'CC-01', name: 'Manufacturing', budget: 2500000 },
    { id: 'CC-02', name: 'R&D', budget: 1200000 },
    { id: 'CC-03', name: 'Projects', budget: 1500000 },
  ],
  users: [
    { id: 'u1', name: 'Rohit Sharma', role: 'Procurement Head', email: 'rohit@vidyut.co' },
    { id: 'u2', name: 'Meera Nair', role: 'Finance', email: 'meera@vidyut.co' },
    { id: 'u3', name: 'Aakash Jain', role: 'Engineering', email: 'aakash@vidyut.co' },
  ],
}

export default function EnterpriseProfilePage() {
  const [requiresApproval, setRequiresApproval] = useState(enterprise.poTerms.requiresApproval)

  return (
    <div className="container-wide py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6" />{enterprise.companyName}</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{enterprise.contacts.email}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{enterprise.contacts.phone}</span>
          </div>
        </div>
        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700" aria-label="Edit Company Profile">
          <Link href="/enterprise/profile/edit">Edit Company Profile</Link>
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="po-terms">PO Terms</TabsTrigger>
          <TabsTrigger value="billing">Billing & Shipping</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Company */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label>Company Name</Label><Input defaultValue={enterprise.companyName} /></div>
              <div><Label>Corporate Domain</Label><Input defaultValue={enterprise.domain} /></div>
              <div><Label>GST</Label><Input defaultValue={enterprise.gst} /></div>
              <div><Label>CIN</Label><Input defaultValue={enterprise.cin} /></div>
              <div className="md:col-span-2"><Label>Registered Address</Label><Textarea defaultValue={enterprise.address} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Cost Centers</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {enterprise.costCenters.map(cc => (
                <div key={cc.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                  <div className="font-medium">{cc.name} <span className="text-muted-foreground">({cc.id})</span></div>
                  <div>Budget: ₹{cc.budget.toLocaleString('en-IN')}</div>
                </div>
              ))}
              <Button variant="outline">Add Cost Center</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users & Roles */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Team</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {enterprise.users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-muted-foreground">{u.role} • {u.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Assign Role</Button>
                    <Button variant="outline" size="sm">Remove</Button>
                  </div>
                </div>
              ))}
              <Button className="bg-blue-600 text-white hover:bg-blue-700">Invite User</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PO Terms */}
        <TabsContent value="po-terms" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Purchase Order Terms</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval Workflow</Label>
                  <div className="text-xs text-muted-foreground">POs must be approved before placement</div>
                </div>
                <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Minimum Order Value (₹)</Label>
                  <Input type="number" min={0} defaultValue={enterprise.poTerms.minOrderValue} />
                </div>
                <div>
                  <Label>Credit Days</Label>
                  <Input type="number" min={0} step={1} defaultValue={enterprise.poTerms.creditDays} />
                </div>
                <div><Label>Allowed Payment Methods</Label><Input defaultValue={enterprise.poTerms.allowedPaymentMethods.join(', ')} /></div>
              </div>
              <Button>Save PO Terms</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing & Shipping */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Addresses</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label>Billing Address</Label><Textarea defaultValue={enterprise.billingAddress} /></div>
              <div><Label>Default Shipping Address</Label><Textarea defaultValue={enterprise.address} /></div>
              <div className="md:col-span-2"><Button>Save Addresses</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Compliance & Certifications</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" />GST: <span className="font-medium">{enterprise.gst}</span></div>
              <div className="flex items-center gap-2"><FileCheck2 className="h-4 w-4" />Vendor Code: <span className="font-medium">VIDYUT-001</span></div>
              <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" />TDS Applicable: <Badge variant="secondary">Yes</Badge></div>
              <Button variant="outline">Upload Certificates</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


