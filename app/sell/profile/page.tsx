"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DollarSign, Shield, Banknote, Building2, CheckCircle2, Clock, Upload, Edit, Mail, Phone, MapPin, Users } from 'lucide-react'

const seller = {
  id: 'seller-1',
  name: 'TechFlow Solutions',
  email: 'contact@techflow.com',
  phone: '+91 98765 43210',
  avatar: '/product-1.jpg',
  businessName: 'TechFlow Electricals',
  businessType: 'Enterprise',
  gstNumber: '27ABCDE1234F1Z5',
  address: 'Plot 21, MIDC Industrial Area, Pune, Maharashtra 411019',
  storeDescription: 'Leading provider of smart electrical solutions for residential, commercial and industrial needs.',
  banner: '/hero-electrical.jpg',
  kyc: {
    status: 'verified' as 'pending' | 'verified' | 'rejected',
    lastUpdated: '2025-08-10',
  },
  payouts: {
    bankName: 'HDFC Bank',
    accountMasked: 'XXXXXX1234',
    ifsc: 'HDFC0000456',
    upi: 'techflow@hdfcbank',
    autoPayouts: true,
  },
  metrics: {
    totalRevenue: 342500,
    totalOrders: 1247,
    avgOrderValue: 2746,
    payoutPending: 84500,
  },
  team: [
    { id: 't1', name: 'Anita Desai', role: 'Owner', email: 'anita@techflow.com' },
    { id: 't2', name: 'Rahul Verma', role: 'Sales Manager', email: 'rahul@techflow.com' },
    { id: 't3', name: 'Sneha Iyer', role: 'Operations', email: 'sneha@techflow.com' },
  ],
}

export default function SellerProfilePage() {
  const [autoPayouts, setAutoPayouts] = useState(seller.payouts.autoPayouts)

  const formatPrice = (v: number) => `₹${v.toLocaleString('en-IN')}`

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={seller.avatar} />
            <AvatarFallback>{seller.businessName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{seller.businessName}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{seller.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{seller.phone}</span>
            </div>
          </div>
        </div>
        <Button className="bg-blue-600 text-white hover:bg-blue-700"><Edit className="mr-2 h-4 w-4" />Edit Profile</Button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" /><div className="text-xl font-bold">{formatPrice(seller.metrics.totalRevenue)}</div><div className="text-xs text-muted-foreground">Total Revenue</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Building2 className="h-6 w-6 text-blue-600 mx-auto mb-1" /><div className="text-xl font-bold">{seller.metrics.totalOrders}</div><div className="text-xs text-muted-foreground">Total Orders</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Banknote className="h-6 w-6 text-purple-600 mx-auto mb-1" /><div className="text-xl font-bold">{formatPrice(seller.metrics.avgOrderValue)}</div><div className="text-xs text-muted-foreground">Avg. Order Value</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="h-6 w-6 text-orange-600 mx-auto mb-1" /><div className="text-xl font-bold">{formatPrice(seller.metrics.payoutPending)}</div><div className="text-xs text-muted-foreground">Payout Pending</div></CardContent></Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="payouts">Bank & Payouts</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{seller.address}</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" />GST: {seller.gstNumber}</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4" />Team members: {seller.team.length}</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storefront</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input defaultValue={seller.businessName} />
              </div>
              <div>
                <Label>Store Description</Label>
                <Textarea defaultValue={seller.storeDescription} rows={4} />
              </div>
              <div>
                <Label>Address</Label>
                <Input defaultValue={seller.address} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Upload Banner</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank & Payouts */}
        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Bank</Label>
                  <Input defaultValue={seller.payouts.bankName} />
                </div>
                <div>
                  <Label>Account</Label>
                  <Input defaultValue={seller.payouts.accountMasked} />
                </div>
                <div>
                  <Label>IFSC</Label>
                  <Input defaultValue={seller.payouts.ifsc} />
                </div>
                <div>
                  <Label>UPI</Label>
                  <Input defaultValue={seller.payouts.upi} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Auto Payouts</Label>
                  <div className="text-xs text-muted-foreground">Daily payout to your bank</div>
                </div>
                <Switch checked={autoPayouts} onCheckedChange={setAutoPayouts} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Test Deposit</Button>
                <Button>Save Payout Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification */}
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>KYC & Business Verification</CardTitle>
              {seller.kyc.status === 'verified' ? (
                <Badge className="bg-green-600 text-white flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Verified</Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>GST Number: <span className="font-medium">{seller.gstNumber}</span></div>
              <div>Last Updated: {seller.kyc.lastUpdated}</div>
              <div className="flex gap-2">
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Upload Documents</Button>
                <Button>Submit for Review</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seller.team.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-sm text-muted-foreground">{m.role} • {m.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Manage</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4"><Button className="bg-blue-600 text-white hover:bg-blue-700">Invite Member</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


