'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartStore } from '@/types/product'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,

      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id)
          let updatedItems: CartItem[]
          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + 1, product.stock)
            updatedItems = state.items.map((item) =>
              item.id === product.id ? { ...item, quantity: newQuantity } : item
            )
          } else {
            updatedItems = [...state.items, { ...product, quantity: 1 }]
          }

          const totals = updatedItems.reduce(
            (acc, item) => {
              acc.totalItems += item.quantity
              acc.totalPrice += item.price * item.quantity
              return acc
            },
            { totalItems: 0, totalPrice: 0 }
          )

          return {
            items: updatedItems,
            totalItems: totals.totalItems,
            totalPrice: totals.totalPrice,
          }
        })
      },
      removeItem: (productId) => {
        const { items } = get()
        const itemToRemove = items.find((item) => item.id === productId)
        
        if (itemToRemove) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
            totalItems: state.totalItems - itemToRemove.quantity,
            totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity)
          }))
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => {
          const existingItem = state.items.find((item) => item.id === productId)
          if (!existingItem) {
            return state
          }
          const maxQuantity = Math.min(quantity, existingItem.stock)
          const updatedItems = state.items.map((item) =>
            item.id === productId ? { ...item, quantity: maxQuantity } : item
          )
          const totals = updatedItems.reduce(
            (acc, item) => {
              acc.totalItems += item.quantity
              acc.totalPrice += item.price * item.quantity
              return acc
            },
            { totalItems: 0, totalPrice: 0 }
          )
          return {
            items: updatedItems,
            totalItems: totals.totalItems,
            totalPrice: totals.totalPrice,
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0
        })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen }))
    }),
    {
      name: 'vidyut-cart',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      })
    }
  )
)



