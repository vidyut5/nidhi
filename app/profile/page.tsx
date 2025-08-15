'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Heart, 
  Bell, 
  Shield, 
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Package,
  Truck,
  Edit,
  Camera,
  Download,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock user data
const mockUser = {
  id: 'user123',
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  phone: '+91 98765 43210',
  avatar: '/placeholder-avatar.jpg',
  joinedDate: new Date('2023-06-15'),
  tier: 'Gold',
  totalOrders: 47,
  totalSpent: 285000,
  savedAmount: 35000,
  addresses: [
    {
      id: '1',
      type: 'Home',
      address: '123 Main Street, Sector 15, Gurgaon, Haryana 122001',
      isDefault: true
    },
    {
      id: '2',
      type: 'Office',
      address: '456 Business Park, Cyber City, Gurgaon, Haryana 122002',
      isDefault: false
    }
  ],
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,
    darkMode: false,
    language: 'English'
  }
}

const recentOrders = [
  {
    id: 'ORD-001',
    date: new Date('2024-01-08'),
    status: 'delivered',
    total: 12497,
    items: 3,
    image: '/product-1.jpg'
  },
  {
    id: 'ORD-002',
    date: new Date('2024-01-05'),
    status: 'shipped',
    total: 8999,
    items: 1,
    image: '/product-2.jpg'
  },
  {
    id: 'ORD-003',
    date: new Date('2024-01-02'),
    status: 'delivered',
    total: 5499,
    items: 2,
    image: '/product-3.jpg'
  }
]

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string): React.ComponentProps<typeof Badge>["variant"] => {
    switch (status) {
      case 'delivered':
        return 'default'
      case 'shipped':
        return 'secondary'
      case 'processing':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Silver': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'Bronze': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getTierColor(user.tier))}
              >
                {user.tier} Member
              </Badge>
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              Member since {formatDate(user.joinedDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.totalOrders}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatPrice(user.totalSpent)}</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatPrice(user.savedAmount)}</div>
            <div className="text-sm text-muted-foreground">Amount Saved</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-muted-foreground">Wishlist Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Recent Orders */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/orders">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{order.id}</h4>
                        <Badge variant={getStatusBadge(order.status) as any}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(order.date)}</span>
                        <span>•</span>
                        <span>{order.items} items</span>
                        <span>•</span>
                        <span className="font-medium">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/tracking/${order.id}`}>
                          <Truck className="mr-2 h-4 w-4" />
                          Track
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Information */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user.name}
                    disabled={!isEditing}
                    onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled={!isEditing}
                    onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={user.phone}
                    disabled={!isEditing}
                    onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tier">Membership Tier</Label>
                  <Input
                    id="tier"
                    value={user.tier}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                    <Button onClick={() => {
                    setIsEditing(false)
                  }}>
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Saved Addresses</CardTitle>
                <Button size="sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.addresses.map((address) => (
                  <div key={address.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{address.type}</h4>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{address.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive order updates and important information
                  </div>
                </div>
                <Switch
                  checked={user.preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setUser(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailNotifications: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Get delivery updates via SMS
                  </div>
                </div>
                <Switch
                  checked={user.preferences.smsNotifications}
                  onCheckedChange={(checked) =>
                    setUser(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, smsNotifications: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Promotional Emails</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive deals, offers, and product recommendations
                  </div>
                </div>
                <Switch
                  checked={user.preferences.promotionalEmails}
                  onCheckedChange={(checked) =>
                    setUser(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, promotionalEmails: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive">
                <User className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}