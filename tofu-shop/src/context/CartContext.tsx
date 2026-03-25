'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem } from '@/lib/types'

interface CartCtx {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  clearCart: () => void
  total: number
  count: number
  hydrated: boolean
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tofu-cart')
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem('tofu-cart', JSON.stringify(items))
  }, [items, hydrated])

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.variantId === newItem.variantId)
      if (exists) {
        return prev.map(i => i.variantId === newItem.variantId
          ? { ...i, quantity: i.quantity + newItem.quantity }
          : i)
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (variantId: string) =>
    setItems(prev => prev.filter(i => i.variantId !== variantId))

  const updateQty = (variantId: string, qty: number) => {
    if (qty <= 0) { removeItem(variantId); return }
    setItems(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity: qty } : i))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, hydrated }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
