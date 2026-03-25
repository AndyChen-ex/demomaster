'use client'
import { useState } from 'react'

interface OrderItem {
  id: string; quantity: number; priceAtPurchase: number
  variant: { unitName: string; product: { title: string } }
}
interface Order {
  id: string; createdAt: string; status: string; total: number
  name: string | null; phone: string | null; address: string | null
  shipping: string; payment: string; couponCode: string | null; discount: number
  memberId: string | null
  items: OrderItem[]
}

const STATUS_OPTIONS = [
  { val: 'preparing', label: '📦 準備中', color: 'bg-yellow-100 text-yellow-700' },
  { val: 'shipped',   label: '🚚 出貨中', color: 'bg-blue-100 text-blue-700'     },
  { val: 'delivered', label: '✅ 到貨',   color: 'bg-green-100 text-green-700'   },
]

export default function OrderManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [saving, setSaving] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setSaving(id)
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    }
    setSaving(null)
  }

  if (orders.length === 0) return (
    <div className="text-center py-20 text-[#a07840]">
      <div className="text-5xl mb-3">📋</div>
      <p>尚未有任何訂單</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {orders.map(order => {
        const s = STATUS_OPTIONS.find(x => x.val === order.status) ?? STATUS_OPTIONS[0]
        const isOpen = expanded === order.id

        return (
          <div key={order.id} className="bg-white rounded-2xl border border-[#e8dcc8] overflow-hidden">
            {/* Row */}
            <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#fffdf5]"
              onClick={() => setExpanded(isOpen ? null : order.id)}>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-ink">#{order.id.slice(0,8).toUpperCase()}</span>
                  <span className="text-[10px] text-[#a07840]">
                    {new Date(order.createdAt).toLocaleDateString('zh-TW', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })}
                  </span>
                  {order.memberId && <span className="text-[10px] bg-[#fdf3e0] text-[#c8973a] px-1.5 py-0.5 rounded font-semibold">會員</span>}
                </div>
                <div className="text-xs text-[#a07840] mt-0.5 truncate">
                  {order.name} · {order.phone} · {order.shipping === 'delivery' ? '宅配' : '超商'}
                </div>
              </div>

              <span className="font-black text-[#c8973a] text-sm whitespace-nowrap">
                ${order.total.toLocaleString()}
              </span>

              {/* Status selector */}
              <select
                value={order.status}
                disabled={saving === order.id}
                onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value) }}
                onClick={e => e.stopPropagation()}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer disabled:opacity-50 ${s.color}`}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.val} value={opt.val}>{opt.label}</option>
                ))}
              </select>

              <span className={`text-[#a07840] text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div className="border-t border-[#f0e8d8] px-5 py-4 space-y-3 bg-[#faf7f2]">
                {/* Items */}
                <div className="space-y-1.5">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-ink">
                        {item.variant.product.title}
                        <span className="text-[#a07840] text-xs ml-1">({item.variant.unitName})</span>
                        <span className="text-[#a07840] text-xs ml-1">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold text-[#c8973a]">
                        ${(item.priceAtPurchase * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#6b4c1e] pt-2 border-t border-[#e8dcc8]">
                  <div><span className="text-[#a07840]">配送地址：</span>{order.address || '—'}</div>
                  <div><span className="text-[#a07840]">付款方式：</span>{order.payment === 'transfer' ? '匯款' : '刷卡'}</div>
                  {order.couponCode && (
                    <div><span className="text-[#a07840]">優惠碼：</span>{order.couponCode} (折 ${order.discount})</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
