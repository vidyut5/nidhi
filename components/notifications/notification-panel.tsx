'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotificationStore } from '@/lib/notification-store'
import { 
  Bell, 
  Check, 
  X, 
  MoreVertical,
  Package,
  Tag,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  CheckCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationButtonProps {
  className?: string
  variant?: 'button' | 'icon'
}

export function NotificationButton({ className, variant = 'icon' }: NotificationButtonProps) {
  const { unreadCount } = useNotificationStore()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === 'icon' ? 'icon' : 'sm'}
          className={cn("relative", className)}
        >
          <Bell className="h-4 w-4" />
          {variant === 'button' && <span className="ml-2">Notifications</span>}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationPanel />
      </PopoverContent>
    </Popover>
  )
}

function NotificationPanel() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAllNotifications 
  } = useNotificationStore()

  const getNotificationIcon = (type: string) => {
    const iconProps = { className: "h-4 w-4" }
    
    switch (type) {
      case 'order':
        return <Package {...iconProps} className="h-4 w-4 text-blue-600" />
      case 'promotion':
        return <Tag {...iconProps} className="h-4 w-4 text-green-600" />
      case 'success':
        return <CheckCircle {...iconProps} className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle {...iconProps} className="h-4 w-4 text-orange-600" />
      case 'error':
        return <XCircle {...iconProps} className="h-4 w-4 text-red-600" />
      default:
        return <Info {...iconProps} className="h-4 w-4 text-blue-600" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return `${diffInDays}d ago`
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No notifications</h3>
        <p className="text-sm text-muted-foreground">
          You're all caught up! New notifications will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount}</Badge>
          )}
        </h3>
        
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={clearAllNotifications}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 hover:bg-accent/50 transition-colors relative",
              !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
            )}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "text-sm font-medium truncate",
                      !notification.isRead && "font-semibold"
                    )}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {/* Action Button */}
                    {notification.actionUrl && notification.actionText && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 mt-2 text-xs"
                        asChild
                      >
                        <Link 
                          href={notification.actionUrl}
                          onClick={() => markAsRead(notification.id)}
                        >
                          {notification.actionText}
                        </Link>
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!notification.isRead && (
                          <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => removeNotification(notification.id)}
                          className="text-destructive"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Image if available */}
                {notification.imageUrl && (
                  <div className="mt-2">
                    <Image
                      src={notification.imageUrl}
                      alt=""
                      width={60}
                      height={60}
                      className="rounded object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Unread indicator */}
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-center">
        <Button variant="ghost" size="sm" asChild className="w-full">
          <Link href="/notifications">
            View All Notifications
          </Link>
        </Button>
      </div>
    </div>
  )
}

