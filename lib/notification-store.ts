'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promotion'
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  actionText?: string
  imageUrl?: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearAllNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [
        // Demo notifications
        {
          id: '1',
          title: 'Order Shipped',
          message: 'Your order #ORD-001 has been shipped and is on its way!',
          type: 'order',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          actionUrl: '/orders',
          actionText: 'Track Order',
          imageUrl: '/product-1.jpg'
        },
        {
          id: '2',
          title: 'Flash Sale Alert!',
          message: '🔥 50% off on all LED lights! Limited time offer.',
          type: 'promotion',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          actionUrl: '/category/lighting?sale=true',
          actionText: 'Shop Now'
        },
        {
          id: '3',
          title: 'Welcome to Vidyut!',
          message: 'Thank you for joining our electrical marketplace. Start exploring premium products.',
          type: 'info',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          actionUrl: '/search',
          actionText: 'Browse Products'
        },
        {
          id: '4',
          title: 'Low Stock Alert',
          message: 'Your product "Smart WiFi Switch" is running low on stock (5 remaining).',
          type: 'warning',
          isRead: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          actionUrl: '/sell/products',
          actionText: 'Manage Inventory'
        }
      ],
      unreadCount: 3,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          isRead: false,
          createdAt: new Date(),
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }))
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId)
          if (notification && !notification.isRead) {
            return {
              notifications: state.notifications.map(n => 
                n.id === notificationId ? { ...n, isRead: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1)
            }
          }
          return state
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0
        }))
      },

      removeNotification: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId)
          const wasUnread = notification && !notification.isRead
          
          return {
            notifications: state.notifications.filter(n => n.id !== notificationId),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          }
        })
      },

      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0
        })
      }
    }),
    {
      name: 'vidyut-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
)



