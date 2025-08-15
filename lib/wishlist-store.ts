'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  imageUrl: string
  brand?: string
  stock: number
  rating: number
  reviewCount: number
  sellerId: string
  sellerName: string
  addedAt: Date
}

interface WishlistStore {
  items: WishlistItem[]
  totalItems: number
  
  // Actions
  addItem: (product: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,

      addItem: (product) => {
        const { items } = get()
        const existingItem = items.find((item) => item.id === product.id)

        if (!existingItem) {
          const newItem: WishlistItem = { ...product, addedAt: new Date() }
          set((state) => ({
            items: [newItem, ...state.items],
            totalItems: state.totalItems + 1
          }))
        }
      },

      removeItem: (productId) => {
        const { items } = get()
        const exists = items.some((item) => item.id === productId)
        
        if (exists) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
            totalItems: state.totalItems - 1
          }))
        }
      },

      clearWishlist: () => {
        set({
          items: [],
          totalItems: 0
        })
      },

      isInWishlist: (productId) => {
        const { items } = get()
        return items.some((item) => item.id === productId)
      }
    }),
    {
      name: 'vidyut-wishlist',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems
      })
    }
  )
)




