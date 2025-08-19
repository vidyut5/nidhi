"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SupportWidget } from '@/components/support/support-widget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  Share,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { products as demoProducts } from '@/lib/dummy-data'

interface OrderStatus {
  id: string
  status: 'ordered' | 'confirmed' | 'processing' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled'
  timestamp: Date
  message: string
  location?: string
}

interface OrderTracking {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  expectedDelivery: Date
  totalAmount: number
  currentStatus: string
  trackingNumber: string
  timeline: OrderStatus[]
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }>
}

interface OrderTrackingClientProps {
  orderId: string
}

export default function OrderTrackingClient({ orderId }: OrderTrackingClientProps) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [supportOpen, setSupportOpen] = useState(false)
  const [contactTarget, setContactTarget] = useState<'seller' | 'vidyut' | null>(null)
  const [thread, setThread] = useState<{ id: string; author: string; content: string; createdAt: string }[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const buildDemo = (demoId: string): OrderTracking => {
      const num = Number((demoId.match(/demo-order-(\d+)/)?.[1] || '1'))
      const p1 = demoProducts[(num * 3) % demoProducts.length]
      const p2 = demoProducts[(num * 3 + 1) % demoProducts.length]
      const created = new Date(Date.now() - num * 24 * 60 * 60 * 1000)
      const subtotal = p1.price * (1 + (num % 2)) + p2.price
      return {
        orderId: `DEMO-${1000 + num}`,
        customerName: 'Guest',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: 'India',
        expectedDelivery: new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000),
        totalAmount: subtotal,
        currentStatus: 'shipped',
        trackingNumber: 'N/A',
        timeline: [
          { id: '1', status: 'ordered', timestamp: new Date(created), message: 'Order placed' },
          { id: '2', status: 'confirmed', timestamp: new Date(created.getTime() + 5 * 60 * 1000), message: 'Order confirmed' },
          { id: '3', status: 'processing', timestamp: new Date(created.getTime() + 30 * 60 * 1000), message: 'Processing' },
          { id: '4', status: 'shipped', timestamp: new Date(created.getTime() + 24 * 60 * 60 * 1000), message: 'Shipped' },
          { id: '5', status: 'delivered', timestamp: new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000), message: 'Delivered' },
        ],
        items: [
          { id: '1', name: p1.name, quantity: 1 + (num % 2), price: p1.price, image: Array.isArray(p1.images) && p1.images[0] ? p1.images[0] : '/product-1.jpg' },
          { id: '2', name: p2.name, quantity: 1, price: p2.price, image: Array.isArray(p2.images) && p2.images[0] ? p2.images[0] : '/product-2.jpg' },
        ],
      }
    }
    async function load() {
      try {
        if (orderId.startsWith('demo-order-')) {
          setTracking(buildDemo(orderId))
          return
        }
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { signal: controller.signal })
        if (!res.ok) {
          setTracking(buildDemo('demo-order-1'))
          return
        }
        const data = await res.json()
        const mapped: OrderTracking = {
          orderId: data.orderNumber,
          customerName: 'Your Name',
          customerEmail: '',
          customerPhone: '',
          deliveryAddress: (() => { try { const a = JSON.parse(data.shippingAddress); return `${a.line1}, ${a.city} ${a.postalCode}` } catch { return '' } })(),
          expectedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : new Date(),
          totalAmount: data.totalAmount,
          currentStatus: data.status,
          trackingNumber: data.trackingNumber || 'N/A',
          timeline: (Array.isArray(data.timeline) ? data.timeline : []).map((t: any, i: number) => ({
            id: String(i + 1),
            status: t.status,
            timestamp: new Date(t.timestamp),
            message: t.label,
            location: ''
          })),
          items: data.items.map((it: any) => ({ id: it.id, name: it.product.name, quantity: it.quantity, price: it.price, image: it.product.imageUrl || '/product-1.jpg' }))
        }
        setTracking(mapped)
      } catch {
        if (orderId.startsWith('demo-order-')) setTracking(buildDemo(orderId))
        else setTracking(null)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [orderId])

  useEffect(() => {
    if (!contactTarget) return
    let active = true
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(String(orderId))}/messages?target=${contactTarget}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (active) setThread(data)
      } catch {}
    }
    load()
    const id = setInterval(load, 4000)
    return () => { active = false; clearInterval(id) }
  }, [contactTarget, orderId])

  async function sendMessage() {
    const content = messageInput.trim()
    if (!content || !contactTarget) return
    setMessageInput('')
    const optimistic = { id: `tmp_${Date.now()}`, author: 'buyer', content, createdAt: new Date().toISOString() }
    setThread(prev => [...prev, optimistic])
    try {
      await fetch(`/api/orders/${encodeURIComponent(String(orderId))}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: contactTarget, content })
      })
    } catch {}
  }
  
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string, isActive: boolean, isCompleted: boolean) => {
    const iconProps = {
      className: cn(
        "h-6 w-6",
        isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-400"
      )
    }

    switch (status) {
      case 'ordered':
        return <Package {...iconProps} />
      case 'confirmed':
        return <CheckCircle {...iconProps} />
      case 'shipped':
        return <Truck {...iconProps} />
      case 'out-for-delivery':
        return <MapPin {...iconProps} />
      case 'delivered':
        return <CheckCircle {...iconProps} />
      default:
        return <Clock {...iconProps} />
    }
  }

  const getStatusProgress = (currentStatus: string) => {
    const statusOrder = ['ordered', 'confirmed', 'shipped', 'out-for-delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(currentStatus)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order not found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find an order with ID: {orderId}
            </p>
            <Button asChild>
              <Link href="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStatusIndex = tracking.timeline.findIndex(t => t.status === tracking.currentStatus)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Track Order</h1>
          <p className="text-muted-foreground">Order #{tracking.orderId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const url = typeof window !== 'undefined' ? window.location.href : ''
            if ((navigator as any)?.share) {
              (navigator as any).share({ title: 'Order Details', url }).catch(() => {})
            } else if (navigator.clipboard) {
              navigator.clipboard.writeText(url).catch(() => {})
            }
          }}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/orders/${encodeURIComponent(String(orderId))}/invoice`} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Invoice
            </a>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tracking Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Delivery Status</span>
                <Badge variant="outline" className="text-xs">
                  {tracking.trackingNumber}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(getStatusProgress(tracking.currentStatus))}% Complete
                  </span>
                </div>
                <Progress value={getStatusProgress(tracking.currentStatus)} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ordered</span>
                  <span className="font-medium">
                    Expected: {formatDate(tracking.expectedDelivery)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tracking.timeline.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex
                  const isActive = index === currentStatusIndex
                  const isFuture = index > currentStatusIndex

                  return (
                    <div key={status.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full border-2",
                          isCompleted ? "bg-green-50 border-green-200" : 
                          isActive ? "bg-blue-50 border-blue-200" : 
                          "bg-gray-50 border-gray-200"
                        )}>
                          {getStatusIcon(status.status, isActive, isCompleted)}
                        </div>
                        {index < tracking.timeline.length - 1 && (
                          <div className={cn(
                            "w-0.5 h-12 mt-2",
                            isCompleted ? "bg-green-200" : "bg-gray-200"
                          )} />
                        )}
                      </div>
                       
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "font-medium",
                            isCompleted ? "text-green-900" : 
                            isActive ? "text-blue-900" : 
                            "text-gray-500"
                          )}>
                            {status.message}
                          </h4>
                          {!isFuture && (
                            <span className="text-sm text-muted-foreground">
                              {formatDate(status.timestamp)}
                            </span>
                          )}
                        </div>
                        {status.location && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {status.location}
                          </p>
                        )}
                        {isFuture && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Expected: {formatDate(status.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">{tracking.customerName}</h4>
                <p className="text-sm text-muted-foreground">
                  {tracking.deliveryAddress}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{tracking.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{tracking.customerEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tracking.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Total Amount</span>
                <span>{formatPrice(tracking.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Contact our support team for any delivery concerns.
              </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setSupportOpen(true)}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Dialog */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {!contactTarget ? (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setContactTarget('seller')}>Contact Seller</Button>
              <Button variant="outline" onClick={() => setContactTarget('vidyut')}>Contact Vidyut</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Choose how you want to reach {contactTarget === 'seller' ? 'the seller' : 'Vidyut support'}:</div>
              <div className="grid grid-cols-3 gap-2">
                <Button asChild variant="outline">
                  <a href={`tel:${contactTarget === 'seller' ? '+919999999999' : '+918888888888'}`}>Call</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${contactTarget === 'seller' ? 'seller@example.com' : 'support@example.com'}`}>Email</a>
                </Button>
                <Button variant="outline" onClick={() => setChatOpen(true)}>Message</Button>
              </div>
              <div className="border rounded-md h-48 overflow-y-auto p-2 space-y-2 bg-muted/30">
                {thread.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No messages yet. Start the conversation.</div>
                ) : thread.map(m => (
                  <div key={m.id} className={m.author === 'buyer' ? 'text-right' : ''}>
                    <div className={`inline-block px-3 py-2 rounded-lg text-sm ${m.author === 'buyer' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-800 border'}`}>
                      {m.content}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Type your message" className="flex-1 border rounded-md px-3 py-2 text-sm bg-background" />
                <Button onClick={sendMessage} size="sm">Send</Button>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          {contactTarget ? (
            <Button variant="ghost" onClick={() => setContactTarget(null)}>Back</Button>
          ) : null}
          <Button onClick={() => { setSupportOpen(false); setContactTarget(null) }}>Close</Button>
        </DialogFooter>
      </Dialog>

      {/* Floating Chat Sheet */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{contactTarget === 'seller' ? 'Chat with Seller' : 'Chat with Vidyut Support'}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {thread.length === 0 ? (
                <div className="text-xs text-muted-foreground">No messages yet. Start the conversation.</div>
              ) : thread.map(m => (
                <div key={m.id} className={m.author === 'buyer' ? 'text-right' : ''}>
                  <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${m.author === 'buyer' ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
                    {m.content}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <div className="border-t p-2 flex items-center gap-2">
              <input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Type a message" className="flex-1 border rounded-full px-4 py-2 text-sm bg-background" />
              <Button size="sm" onClick={sendMessage}>Send</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Compact widget like reference screenshot */}
      <SupportWidget orderId={String(orderId)} defaultTarget="vidyut" />
    </div>
  )
}
