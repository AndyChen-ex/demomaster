'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'orders' | 'name' | 'password'

interface OrderItem {
  id: string
  quantity: number
  priceAtPurchase: number
  variant: { unitName: string; product: { title: string } }
}

interface Order {
  id: string
  createdAt: string
  status: 'preparing' | 'shipped' | 'delivered'
  total: number
  shipping: string
  payment: string
  items: OrderItem[]
}

const STATUS_LABEL: Record<string, { label: string; color: string; emoji: string }> = {
  preparing: { label: '準備中', color: 'bg-yellow-100 text-yellow-700', emoji: '📦' },
  shipped:   { label: '出貨中', color: 'bg-blue-100 text-blue-700',     emoji: '🚚' },
  delivered: { label: '到貨',   color: 'bg-green-100 text-green-700',   emoji: '✅' },
}

export default function ProfilePage() {
  const router = useRouter()
  const [tab, setTab]       = useState<Tab>('orders')
  const [member, setMember] = useState<{ name?: string; email: string } | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // name form
  const [newName, setNewName]   = useState('')
  const [nameMsg, setNameMsg]   = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  // password form
  const [curPwd, setCurPwd]   = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [cfmPwd, setCfmPwd]   = useState('')
  const [pwdMsg, setPwdMsg]   = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data) { router.push('/login'); return }
      setMember(data)
      setNewName(data.name ?? '')
    })
    fetch('/api/orders').then(r => r.json()).then(data => {
      setOrders(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [router])

  const saveName = async () => {
    setNameMsg(''); setNameSaving(true)
    const res  = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    const data = await res.json()
    if (res.ok) {
      setNameMsg('✓ 暱稱已更新，頁面更新中...')
      setTimeout(() => window.location.reload(), 800)
    } else {
      setNameMsg(data.error)
      setNameSaving(false)
    }
  }

  const savePassword = async () => {
    setPwdMsg('');
    if (newPwd !== cfmPwd) { setPwdMsg('新密碼與確認密碼不符'); return }
    setPwdSaving(true)
    const res  = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }),
    })
    const data = await res.json()
    setPwdMsg(res.ok ? '✓ 密碼已更新' : data.error)
    if (res.ok) { setCurPwd(''); setNewPwd(''); setCfmPwd('') }
    setPwdSaving(false)
  }

  if (!member) return null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'orders',   label: '📋 我的訂單' },
    { key: 'name',     label: '✏️ 修改暱稱' },
    { key: 'password', label: '🔑 修改密碼' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f7f2e8' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Member card */}
        <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#2c1f0e,#6b4c1e)' }}>
            {(member.name || member.email)[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-ink text-lg">{member.name || '會員'}</div>
            <div className="text-sm text-[#a07840] truncate">{member.email}</div>
          </div>
          <Link href="/" className="text-sm text-[#a07840] hover:text-[#c8973a]">← 回商店</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#e8dcc8] rounded-xl p-1 mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
                ${tab === t.key ? 'text-white shadow' : 'text-[#a07840] hover:text-ink'}`}
              style={tab === t.key ? { background: '#2c1f0e' } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── 我的訂單 ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-[#a07840]">載入中...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-[#a07840]">
                <div className="text-5xl mb-3">🧺</div>
                <p className="font-semibold">尚未有任何訂單</p>
                <Link href="/" className="text-[#c8973a] text-sm mt-2 inline-block hover:underline">去逛逛 →</Link>
              </div>
            ) : orders.map(order => {
              const s = STATUS_LABEL[order.status] ?? STATUS_LABEL.preparing
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-[#e8dcc8] overflow-hidden">
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0e8d8]" style={{ background: '#faf7f2' }}>
                    <div>
                      <span className="font-mono text-sm text-[#a07840]">#{order.id.slice(0,8).toUpperCase()}</span>
                      <span className="text-sm text-[#a07840] ml-3">
                        {new Date(order.createdAt).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${s.color}`}>
                      {s.emoji} {s.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-3 space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-ink">
                          {item.variant.product.title}
                          <span className="text-[#a07840] text-sm ml-1">({item.variant.unitName})</span>
                        </span>
                        <span className="text-[#a07840]">× {item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0e8d8] bg-[#fffdf5]">
                    <span className="text-sm text-[#a07840]">
                      {order.shipping === 'delivery' ? '🚚 宅配' : '🏪 超商'} ·
                      {order.payment === 'transfer' ? ' 匯款' : ' 刷卡'}
                    </span>
                    <span className="font-black text-[#c8973a]">${order.total.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── 修改暱稱 ── */}
        {tab === 'name' && (
          <div className="bg-white rounded-2xl border border-[#e8dcc8] p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#a07840] block mb-1">暱稱</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="輸入您的暱稱"
                className="w-full border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8973a]" />
            </div>
            {nameMsg && (
              <p className={`text-sm font-semibold ${nameMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {nameMsg}
              </p>
            )}
            <button onClick={saveName} disabled={nameSaving}
              className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 transition-all hover:opacity-90"
              style={{ background: '#2c1f0e' }}>
              {nameSaving ? '儲存中...' : '儲存暱稱'}
            </button>
          </div>
        )}

        {/* ── 修改密碼 ── */}
        {tab === 'password' && (
          <div className="bg-white rounded-2xl border border-[#e8dcc8] p-6 space-y-4">
            {[
              { label: '目前密碼', val: curPwd, set: setCurPwd, placeholder: '輸入目前密碼' },
              { label: '新密碼',   val: newPwd, set: setNewPwd, placeholder: '至少 6 個字元' },
              { label: '確認新密碼', val: cfmPwd, set: setCfmPwd, placeholder: '再輸入一次新密碼' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-sm font-semibold text-[#a07840] block mb-1">{f.label}</label>
                <input type="password" value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8973a]" />
              </div>
            ))}
            {pwdMsg && (
              <p className={`text-sm font-semibold ${pwdMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {pwdMsg}
              </p>
            )}
            <button onClick={savePassword} disabled={pwdSaving}
              className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 transition-all hover:opacity-90"
              style={{ background: '#2c1f0e' }}>
              {pwdSaving ? '儲存中...' : '更新密碼'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
