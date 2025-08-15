'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Eye,
  Star,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Settings,
  Bell,
  Zap
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { LazyVisible } from '@/components/util/lazy-visible'
const SalesChart = dynamic(() => import('@/components/sell/charts').then(m => m.SalesChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />,
})
const CategoryPie = dynamic(() => import('@/components/sell/charts').then(m => m.CategoryPie), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse rounded-md bg-muted" />,
})

// Mock data for dashboard
const salesData = [
  { month: 'Jan', sales: 45000, orders: 124 },
  { month: 'Feb', sales: 52000, orders: 145 },
  { month: 'Mar', sales: 48000, orders: 132 },
  { month: 'Apr', sales: 61000, orders: 167 },
  { month: 'May', sales: 55000, orders: 152 },
  { month: 'Jun', sales: 67000, orders: 189 },
]

const categoryData = [
  { name: 'Switches & Outlets', value: 35, count: 45 },
  { name: 'Lighting', value: 25, count: 32 },
  { name: 'Tools', value: 20, count: 28 },
  { name: 'Industrial', value: 15, count: 18 },
  { name: 'Others', value: 5, count: 7 },
]

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const topProducts = [
  {
    id: '1',
    name: 'Smart WiFi Switch with Energy Monitoring',
    sales: 234,
    revenue: 58500,
    stock: 45,
    rating: 4.8,
    image: '/product-1.jpg'
  },
  {
    id: '2',
    name: 'Industrial LED High Bay Light 150W',
    sales: 189,
    revenue: 170100,
    stock: 23,
    rating: 4.6,
    image: '/product-2.jpg'
  },
  {
    id: '3',
    name: 'Digital Multimeter Professional Grade',
    sales: 156,
    revenue: 85800,
    stock: 67,
    rating: 4.9,
    image: '/product-3.jpg'
  },
]

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Rajesh Kumar',
    product: 'Smart WiFi Switch',
    amount: 2499,
    status: 'completed',
    date: '2024-01-11'
  },
  {
    id: 'ORD-002',
    customer: 'Priya Sharma',
    product: 'LED High Bay Light',
    amount: 8999,
    status: 'processing',
    date: '2024-01-11'
  },
  {
    id: 'ORD-003',
    customer: 'Amit Patel',
    product: 'Digital Multimeter',
    amount: 5499,
    status: 'shipped',
    date: '2024-01-10'
  },
]

export default function SellerDashboard() {
  const [dateRange, setDateRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let idleId: any | null = null
    let timeoutId: any | null = null
    if ((window as any).requestIdleCallback) {
      idleId = (window as any).requestIdleCallback(() => setLoading(false), { timeout: 800 })
    } else {
      timeoutId = setTimeout(() => setLoading(false), 400)
    }
    return () => {
      if (idleId != null) (window as any).cancelIdleCallback?.(idleId)
      if (timeoutId != null) clearTimeout(timeoutId)
    }
  }, [])

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  const getStatusBadge = (status: string): React.ComponentProps<typeof Badge>["variant"] => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'shipped':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Memoize static data to avoid recalculation between renders
  const memoSales = useMemo(() => salesData, [])
  const memoCategories = useMemo(() => categoryData, [])
  const memoColors = useMemo(() => colors, [])
  const memoTop = useMemo(() => topProducts, [])
  const memoOrders = useMemo(() => recentOrders, [])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Seller Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's how your electrical business is performing.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm" asChild>
            <Link href="/sell/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {loading ? (
          // Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 w-2/3">
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-6 bg-muted rounded w-2/3" />
                      <div className="h-3 bg-muted rounded w-3/5" />
                    </div>
                    <div className="h-12 w-12 rounded-full bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold">{formatPrice(342500)}</h3>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+12.5%</span>
                      <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Orders</p>
                    <h3 className="text-2xl font-bold">1,247</h3>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+8.2%</span>
                      <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Products</p>
                    <h3 className="text-2xl font-bold">130</h3>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+3 new</span>
                      <span className="text-sm text-muted-foreground ml-1">this month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customers</p>
                    <h3 className="text-2xl font-bold">892</h3>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+15.3%</span>
                      <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts hidden on mobile for faster feel */}
      <div className="hidden md:grid lg:grid-cols-3 gap-8 mb-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sales Overview</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Last 30 days
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LazyVisible placeholder={<div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />}>
              <Suspense fallback={<div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />}> 
                <SalesChart data={memoSales} formatPrice={formatPrice} />
              </Suspense>
            </LazyVisible>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <LazyVisible placeholder={<div className="h-[200px] w-full animate-pulse rounded-md bg-muted" />}> 
              <Suspense fallback={<div className="h-[200px] w-full animate-pulse rounded-md bg-muted" />}> 
                <CategoryPie data={memoCategories} colors={memoColors} />
              </Suspense>
            </LazyVisible>
            <div className="mt-4 space-y-2">
              {memoCategories.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-medium">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Performing Products</span>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sell/orders">View Orders</Link>
          </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <LazyVisible placeholder={<div className="h-[260px] w-full animate-pulse rounded-md bg-muted" />}>
              <div className="space-y-4">
                {memoTop.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm md:text-base">{product.name}</h4>
                      <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                        <span>{product.sales} sold</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm md:text-base">{formatPrice(product.revenue)}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </LazyVisible>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Orders</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sell/orders">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <LazyVisible placeholder={<div className="h-[260px] w-full animate-pulse rounded-md bg-muted" />}>
              <div className="space-y-4">
                {memoOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 md:h-8 md:w-8">
                        <AvatarFallback>{order.customer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm md:text-base">{order.id}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">{order.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm md:text-base">{formatPrice(order.amount)}</div>
                      <Badge variant={getStatusBadge(order.status)} className="text-[10px] md:text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </LazyVisible>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


