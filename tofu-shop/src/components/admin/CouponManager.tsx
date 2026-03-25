'use client'
import { useState } from 'react'

interface Coupon {
  id: string
  code: string
  discount: number
  expiresAt: string
  createdAt: string
}

export default function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAdd = async () => {
    setError('')
    if (!code.trim() || !discount || !expiresAt) { setError('請填寫所有欄位'); return }
    if (Number(discount) <= 0) { setError('折扣金額須大於 0'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), discount: Number(discount), expiresAt }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '新增失敗'); return }
      setCoupons(prev => [data, ...prev])
      setCode(''); setDiscount(''); setExpiresAt('')
    } catch {
      setError('網路錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此優惠碼？')) return
    setDeleting(id)
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      setCoupons(prev => prev.filter(c => c.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  // Min date = today for the date picker
  const minDate = new Date().toISOString().slice(0, 16)

  return (
    <div className="space-y-5">

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-[#e8dcc8] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#f0e8d8]" style={{ background: '#faf7f2' }}>
          <h3 className="font-bold text-sm text-ink">＋ 新增優惠碼</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#a07840] block mb-1">優惠碼 *</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER100"
                className="w-full border border-[#e8dcc8] rounded-xl px-3 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-[#c8973a] uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#a07840] block mb-1">折扣金額（$）*</label>
              <input
                type="number"
                min="1"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                placeholder="e.g. 100"
                className="w-full border border-[#e8dcc8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c8973a]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#a07840] block mb-1">過期日期 *</label>
              <input
                type="datetime-local"
                min={minDate}
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full border border-[#e8dcc8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c8973a]"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#c8973a' }}
          >
            {loading ? '新增中...' : '新增優惠碼'}
          </button>
        </div>
      </div>

      {/* Coupon list */}
      <div className="bg-white rounded-2xl border border-[#e8dcc8] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#f0e8d8]" style={{ background: '#faf7f2' }}>
          <h3 className="font-bold text-sm text-ink">優惠碼列表（{coupons.length}）</h3>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-12 text-[#a07840]">
            <div className="text-4xl mb-2">🎟️</div>
            <p className="text-sm">尚未建立任何優惠碼</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f7f2e8] text-[#a07840] text-xs">
                  <th className="text-left px-5 py-2.5 font-semibold">優惠碼</th>
                  <th className="text-right px-4 py-2.5 font-semibold">折扣</th>
                  <th className="text-center px-4 py-2.5 font-semibold">過期日期</th>
                  <th className="text-center px-4 py-2.5 font-semibold">狀態</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const expired = isExpired(c.expiresAt)
                  const expiryDate = new Date(c.expiresAt)
                  const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000)

                  return (
                    <tr key={c.id} className="border-t border-[#f0e8d8] hover:bg-[#fffdf5]">
                      <td className="px-5 py-3">
                        <span className="font-mono font-bold tracking-widest text-ink bg-[#f7f2e8] px-2 py-0.5 rounded">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-[#c8973a]">
                        − ${c.discount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-[#6b4c1e] text-xs">
                        {expiryDate.toLocaleDateString('zh-TW', {
                          year: 'numeric', month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                        {!expired && daysLeft <= 7 && (
                          <span className="block text-orange-500 font-semibold mt-0.5">
                            剩 {daysLeft} 天
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          expired
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {expired ? '● 已過期' : '● 有效'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="text-xs text-red-400 hover:text-red-600 font-semibold disabled:opacity-40"
                        >
                          {deleting === c.id ? '刪除中' : '刪除'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
