'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotificationStore } from '@/lib/notification-store'
import { 
  Bell, 
  Check, 
  X, 
  Trash2,
  Package,
  Tag,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Settings,
  CheckCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAllNotifications 
  } = useNotificationStore()

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const getNotificationIcon = (type: string) => {
    const iconProps = { className: "h-5 w-5" }
    
    switch (type) {
      case 'order':
        return <Package {...iconProps} className="h-5 w-5 text-blue-600" />
      case 'promotion':
        return <Tag {...iconProps} className="h-5 w-5 text-green-600" />
      case 'success':
        return <CheckCircle {...iconProps} className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle {...iconProps} className="h-5 w-5 text-orange-600" />
      case 'error':
        return <XCircle {...iconProps} className="h-5 w-5 text-red-600" />
      default:
        return <Info {...iconProps} className="h-5 w-5 text-blue-600" />
    }
  }

  const formatTimeAgo = (dateInput: Date | string) => {
    if (dateInput == null) return 'unknown'
    let date: Date
    if (dateInput instanceof Date) {
      if (!Number.isFinite(dateInput.getTime())) return 'unknown'
      date = dateInput
    } else if (typeof dateInput === 'string') {
      const ts = Date.parse(dateInput)
      if (!Number.isFinite(ts)) return 'unknown'
      date = new Date(ts)
    } else {
      return 'unknown'
    }
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
    } else {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead)
    
    const matchesTypeFilter = 
      typeFilter === 'all' || notification.type === typeFilter

    return matchesReadFilter && matchesTypeFilter
  })

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'order', label: 'Orders' },
    { value: 'promotion', label: 'Promotions' },
    { value: 'warning', label: 'Warnings' },
    { value: 'info', label: 'Info' },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your orders, promotions, and important alerts
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllNotifications}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs value={filter} onValueChange={(value: string) => setFilter(value as 'all' | 'unread' | 'read')}>
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({notifications.filter(n => !n.isRead).length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({notifications.filter(n => n.isRead).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1 border rounded-md bg-background text-sm min-w-[140px]"
        >
          {notificationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notifications */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications found</h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'all' 
                ? "You don't have any notifications yet." 
                : `No ${filter} notifications found.`}
            </p>
            <Button asChild>
              <Link href="/search">
                <Package className="mr-2 h-4 w-4" />
                Start Shopping
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card key={notification.id} className={cn(
              "transition-all hover:shadow-md",
              !notification.isRead && "border-l-4 border-l-blue-600"
            )}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-lg font-semibold mb-2",
                          !notification.isRead && "text-primary"
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          
                          {!notification.isRead && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>

                        {/* Action Button */}
                        {notification.actionUrl && notification.actionText && (
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Link href={notification.actionUrl}>
                                {notification.actionText}
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark Read
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image if available */}
                    {notification.imageUrl && (
                      <div className="mt-4">
                        <Image
                          src={notification.imageUrl}
                          alt=""
                          width={100}
                          height={100}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

