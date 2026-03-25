'use client'
import { useCart } from '@/context/CartContext'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export default function ShippingProgressBar() {
  const { total } = useCart()
  const pct = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const reached = total >= FREE_SHIPPING_THRESHOLD
  const remain = Math.max(FREE_SHIPPING_THRESHOLD - total, 0)

  return (
    <div style={{ background: '#1a1008' }} className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <span className="text-sm text-white/60 whitespace-nowrap flex-shrink-0">
          🧈 免運進度 <strong className="text-[#f0c060]">${FREE_SHIPPING_THRESHOLD.toLocaleString()}</strong>
        </span>

        {/* Track */}
        <div className="relative flex-1 h-3 rounded-full overflow-visible" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: reached
                ? 'linear-gradient(90deg,#4caf50,#81c784)'
                : 'linear-gradient(90deg,#c8973a,#f0c060)',
            }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 text-base transition-all duration-700 pointer-events-none"
            style={{ left: `${Math.min(Math.max(pct, 3), 93)}%`, transform: 'translate(-50%,-50%)' }}
          >🚚</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm">🏁</span>
        </div>

        {/* Hint */}
        <span className={`text-sm font-semibold whitespace-nowrap flex-shrink-0 ${reached ? 'text-green-400' : 'text-white/75'}`}>
          {reached ? '🎉 已享免運！' : `再 $${remain.toLocaleString()} 免運`}
        </span>
      </div>
    </div>
  )
}
