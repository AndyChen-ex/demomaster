'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

type Shipping = 'store' | 'delivery'
type Payment  = 'transfer' | 'card'

export default function CheckoutPage() {
  const { items, total: cartTotal, clearCart, hydrated } = useCart()
  const router = useRouter()

  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponErr, setCouponErr] = useState('')

  const [shipping, setShipping] = useState<Shipping>('delivery')
  const [payment,  setPayment]  = useState<Payment>('transfer')

  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [address, setAddress] = useState('')
  const [storeId, setStoreId] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 100
  const discount    = coupon?.discount ?? 0
  const subtotal    = cartTotal
  const total       = Math.max(subtotal + shippingFee - discount, 0)

  useEffect(() => {
    if (hydrated && items.length === 0) router.push('/')
  }, [hydrated, items.length, router])

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponErr('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (res.ok) {
        setCoupon({ code: data.code, discount: data.discount })
      } else {
        setCoupon(null)
        setCouponErr(data.error || '優惠券無效或已過期')
      }
    } catch {
      setCouponErr('驗證失敗，請稍後再試')
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('請填寫收件人姓名'); return }
    if (!phone.trim()) { setError('請填寫聯絡電話'); return }
    if (shipping === 'delivery' && !address.trim()) { setError('請填寫配送地址'); return }
    if (shipping === 'store' && !storeId.trim()) { setError('請填寫門市編號'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity, priceAtPurchase: i.price })),
          shipping,
          payment,
          couponCode: coupon?.code,
          name: name.trim(),
          phone: phone.trim(),
          address: shipping === 'delivery' ? address.trim() : storeId.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '下訂失敗，請稍後再試'); return }
      clearCart()
      router.push(`/order-success?id=${data.orderId}&total=${data.total}`)
    } catch {
      setError('網路錯誤，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated || items.length === 0) return null

  return (
    <div className="min-h-screen" style={{ background: '#f7f2e8' }}>
      {/* Header */}
      <div style={{ background: '#2c1f0e' }} className="px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-white/50 hover:text-white text-sm transition-colors">← 返回</button>
        <h1 className="text-white font-bold text-base">確認訂單</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Order Items */}
        <Section title="🧺 訂購商品">
          <div className="divide-y divide-[#f0e8d8]">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 pb-2 text-sm font-semibold text-[#a07840] px-1">
              <span>商品</span>
              <span className="text-right">單價</span>
              <span className="text-center">數量</span>
              <span className="text-right">小計</span>
            </div>
            {items.map(item => (
              <div key={item.variantId} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 py-3 items-center px-1">
                <div>
                  <div className="font-semibold text-sm text-ink">{item.productTitle}</div>
                  <div className="text-sm text-[#a07840]">{item.unitName}</div>
                </div>
                <div className="text-sm text-right text-[#a07840]">${item.price.toLocaleString()}</div>
                <div className="text-sm text-center font-bold text-ink">× {item.quantity}</div>
                <div className="text-sm text-right font-black text-[#c8973a]">
                  ${(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Coupon */}
        <Section title="🎟️ 優惠券">
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={e => { setCouponInput(e.target.value); setCouponErr('') }}
              onKeyDown={e => e.key === 'Enter' && applyCoupon()}
              placeholder="輸入優惠碼"
              className="flex-1 border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8973a] bg-white font-mono tracking-widest"
            />
            <button onClick={applyCoupon}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#2c1f0e' }}>
              套用
            </button>
          </div>
          {couponErr && <p className="text-red-500 text-sm mt-1.5">{couponErr}</p>}
          {coupon && (
            <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
              <span className="text-green-700 text-sm font-semibold">✓ {coupon.code} 已套用</span>
              <div className="flex items-center gap-3">
                <span className="text-green-700 text-sm font-bold">− ${coupon.discount}</span>
                <button onClick={() => { setCoupon(null); setCouponInput('') }}
                  className="text-green-400 hover:text-green-700 text-sm">移除</button>
              </div>
            </div>
          )}
          <p className="text-sm text-[#a07840] mt-2 opacity-60">請輸入由店家提供的優惠碼</p>
        </Section>

        {/* Shipping */}
        <Section title="📦 寄送方式">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {([
              { val: 'delivery' as Shipping, label: '宅配到府', sub: '全台配送', emoji: '🚚' },
              { val: 'store'    as Shipping, label: '超商取貨', sub: '7-11 / 全家', emoji: '🏪' },
            ]).map(opt => (
              <button key={opt.val} onClick={() => setShipping(opt.val)}
                className={`p-4 rounded-xl border-[1.5px] text-left transition-all
                  ${shipping === opt.val
                    ? 'border-[#c8973a] bg-[#fdf3e0]'
                    : 'border-[#e8dcc8] bg-white hover:border-[#c8973a]/50'}`}>
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="font-bold text-sm text-ink">{opt.label}</div>
                <div className="text-sm text-[#a07840]">{opt.sub}</div>
                {opt.val === 'delivery' && (
                  <div className="text-sm mt-1 font-semibold text-[#c8973a]">
                    {shippingFee === 0 ? '🎉 免運費' : `運費 $${shippingFee}`}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <FormField label="收件人姓名 *" value={name} onChange={setName} placeholder="王小明" />
            <FormField label="聯絡電話 *"   value={phone} onChange={setPhone} placeholder="09xx-xxx-xxx" type="tel" />
            {shipping === 'delivery'
              ? <FormField label="配送地址 *" value={address} onChange={setAddress} placeholder="台北市大安區忠孝東路..." />
              : <FormField label="門市編號 *" value={storeId} onChange={setStoreId} placeholder="e.g. 123456" />
            }
          </div>
        </Section>

        {/* Payment */}
        <Section title="💳 付款方式">
          <div className="grid grid-cols-2 gap-3">
            {([
              { val: 'transfer' as Payment, label: '銀行匯款', sub: '收到匯款後出貨', emoji: '🏦' },
              { val: 'card'     as Payment, label: '線上刷卡', sub: 'Visa / Mastercard', emoji: '💳' },
            ]).map(opt => (
              <button key={opt.val} onClick={() => setPayment(opt.val)}
                className={`p-4 rounded-xl border-[1.5px] text-left transition-all
                  ${payment === opt.val
                    ? 'border-[#c8973a] bg-[#fdf3e0]'
                    : 'border-[#e8dcc8] bg-white hover:border-[#c8973a]/50'}`}>
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="font-bold text-sm text-ink">{opt.label}</div>
                <div className="text-sm text-[#a07840]">{opt.sub}</div>
              </button>
            ))}
          </div>

          {payment === 'transfer' && (
            <div className="mt-3 p-4 rounded-xl border border-[#e8dcc8] text-sm text-[#6b4c1e] space-y-1.5" style={{ background: '#faf7f2' }}>
              <p className="font-bold text-sm text-[#a07840] mb-2 uppercase tracking-wider">匯款帳號</p>
              <p>銀行：台灣銀行（004）</p>
              <p>帳號：<span className="font-mono font-bold tracking-widest">123-456-789-000</span></p>
              <p>戶名：有德豆腐食品有限公司</p>
              <p className="text-sm text-[#a07840] mt-1">請在備註填入您的姓名，匯款後請來電確認</p>
            </div>
          )}
          {payment === 'card' && (
            <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
              💳 按下「確認下訂」後將跳轉至安全付款頁面（TLS 加密）
            </div>
          )}
        </Section>

        {/* Price Summary */}
        <Section title="📋 金額總覽">
          <div className="space-y-2.5 text-sm">
            <Row label="商品小計" value={`$${subtotal.toLocaleString()}`} />
            <Row
              label={shippingFee === 0 ? '運費（滿額免運）' : '運費'}
              value={shippingFee === 0 ? '免費' : `$${shippingFee}`}
            />
            {coupon && (
              <Row label={`優惠券折扣（${coupon.code}）`} value={`− $${discount}`} highlight />
            )}
            <div className="border-t border-[#e8dcc8] pt-3 flex justify-between items-baseline">
              <span className="font-bold text-ink">應付總額</span>
              <span className="text-2xl font-black text-[#c8973a]">${total.toLocaleString()}</span>
            </div>
          </div>
        </Section>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Place Order */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-2xl text-white text-base font-black tracking-wider shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ background: submitting ? '#a07840' : 'linear-gradient(135deg,#2c1f0e,#6b4c1e)' }}
        >
          {submitting ? '⏳ 訂單處理中...' : `確認下訂  $${total.toLocaleString()}`}
        </button>
        <p className="text-center text-sm text-[#a07840] pb-8">按下後視同同意本店服務條款</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8dcc8] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#f0e8d8]" style={{ background: '#faf7f2' }}>
        <h2 className="font-bold text-sm text-ink">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#a07840] block mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8973a] bg-white" />
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#a07840]">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-green-600' : 'text-ink'}`}>{value}</span>
    </div>
  )
}
