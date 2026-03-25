'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export default function CartSidebar() {
  const { items, removeItem, updateQty, clearCart, total, count, hydrated } = useCart()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  if (!hydrated) return null

  const remain = Math.max(FREE_SHIPPING_THRESHOLD - total, 0)
  const freeShipping = total >= FREE_SHIPPING_THRESHOLD

  const handleCheckout = () => {
    if (!items.length) return
    setOpen(false)
    router.push('/checkout')
  }

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: '#2c1f0e' }}
      >
        🛒
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Toast message */}
      {msg && (
        <div className={`fixed bottom-24 right-6 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg
          ${msg.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-3 opacity-70">✕</button>
        </div>
      )}

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#f7f2e8' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8dcc8]" style={{ background: '#2c1f0e' }}>
          <h2 className="text-white font-bold text-lg">🛒 購物車 ({count})</h2>
          <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[#a07840]">
              <div className="text-5xl mb-3">🧺</div>
              <p>購物車是空的</p>
            </div>
          ) : items.map(item => (
            <div key={item.variantId} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#e8dcc8]">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-ink truncate">{item.productTitle}</div>
                <div className="text-sm text-[#a07840]">{item.unitName}</div>
                <div className="text-[#c8973a] font-bold text-sm mt-0.5">${(item.price * item.quantity).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.variantId, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-[#f7f2e8] border border-[#e8dcc8] text-ink font-bold text-sm hover:bg-[#e8dcc8]">−</button>
                <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                <button onClick={() => updateQty(item.variantId, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-[#f7f2e8] border border-[#e8dcc8] text-ink font-bold text-sm hover:bg-[#e8dcc8]">+</button>
              </div>
              <button onClick={() => removeItem(item.variantId)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#e8dcc8] space-y-3">
            {/* Shipping hint */}
            <div className={`text-center text-sm font-semibold py-2 rounded-lg
              ${freeShipping ? 'bg-green-100 text-green-700' : 'bg-[#fdf3e0] text-[#b8860b]'}`}>
              {freeShipping ? '🎉 已達免運門檻！' : `再 $${remain.toLocaleString()} 即享免運`}
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline px-1">
              <span className="text-[#a07840] text-sm">合計</span>
              <span className="text-2xl font-black text-ink">${total.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl text-white font-bold tracking-wide transition-all active:scale-95"
              style={{ background: '#c8973a' }}
            >
              前往結帳 →
            </button>
            <button onClick={clearCart} className="w-full text-sm text-[#a07840] hover:text-red-500 text-center">清空購物車</button>
          </div>
        )}
      </div>
    </>
  )
}
