'use client'
import { useState } from 'react'
import { ProductData } from '@/lib/types'
import AddProductForm from './AddProductForm'

export default function ProductList({ initialProducts }: { initialProducts: ProductData[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [query, setQuery]         = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({})
  const [saving, setSaving]       = useState<Record<string, boolean>>({})
  const [deleting, setDeleting]   = useState<string | null>(null)

  // inline product edit
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editTitle, setEditTitle]   = useState('')
  const [editDesc, setEditDesc]     = useState('')
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null)
  const [editUploading, setEditUploading] = useState(false)
  const [editSaving, setEditSaving] = useState(false)

  const handleAdded = (p: ProductData) => setProducts(prev => [p, ...prev])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`確定刪除「${title}」？此操作無法復原。`)) return
    setDeleting(id)
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      setProducts(prev => prev.filter(p => p.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const startEdit = (p: ProductData) => {
    setEditingId(p.id)
    setEditTitle(p.title)
    setEditDesc(p.description ?? '')
    setEditImageUrl(p.imageUrl ?? null)
  }

  const cancelEdit = () => setEditingId(null)

  const handleEditImageChange = async (file: File | null) => {
    if (!file) return
    setEditUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '上傳失敗')
      setEditImageUrl(data.url)
    } catch {
      alert('圖片上傳失敗，請重試')
    } finally {
      setEditUploading(false)
    }
  }

  const saveEdit = async (id: string) => {
    setEditSaving(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDesc, imageUrl: editImageUrl }),
      })
      if (res.ok) {
        setProducts(prev => prev.map(p =>
          p.id !== id ? p : { ...p, title: editTitle, description: editDesc, imageUrl: editImageUrl }
        ))
        setEditingId(null)
      }
    } finally {
      setEditSaving(false)
    }
  }

  const handleStockSave = async (variantId: string, productId: string) => {
    const newStock = parseInt(stockEdits[variantId])
    if (isNaN(newStock) || newStock < 0) return
    setSaving(s => ({ ...s, [variantId]: true }))
    try {
      const res = await fetch(`/api/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      })
      if (res.ok) {
        setProducts(prev => prev.map(p =>
          p.id !== productId ? p : {
            ...p,
            variants: p.variants.map(v =>
              v.id !== variantId ? v : { ...v, stock: newStock }
            ),
          }
        ))
        setStockEdits(e => { const n = { ...e }; delete n[variantId]; return n })
      }
    } finally {
      setSaving(s => ({ ...s, [variantId]: false }))
    }
  }

  // filter
  const q = query.trim().toLowerCase()
  const filtered = products.filter(p => {
    if (q && !p.title.toLowerCase().includes(q)) return false
    if (lowStockOnly && !p.variants.some(v => v.stock <= 5)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <AddProductForm onAdded={handleAdded} />

      {/* Search + filter bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a07840] text-sm">🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜尋商品名稱..."
            className="w-full border border-[#e8dcc8] rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-[#c8973a]"
          />
        </div>
        <button
          onClick={() => setLowStockOnly(v => !v)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            lowStockOnly
              ? 'bg-red-50 border-red-300 text-red-600'
              : 'bg-white border-[#e8dcc8] text-[#a07840] hover:border-[#c8973a]'
          }`}
        >
          ⚠️ 低庫存 {lowStockOnly ? '顯示中' : '篩選'}
        </button>
        <span className="self-center text-xs text-[#a07840]">
          {filtered.length} / {products.length} 件商品
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#a07840]">
          <div className="text-5xl mb-4">{products.length === 0 ? '🫘' : '🔍'}</div>
          <p>{products.length === 0 ? '尚未新增任何商品' : '找不到符合條件的商品'}</p>
        </div>
      ) : filtered.map(product => (
        <div key={product.id} className="bg-white border border-[#e8dcc8] rounded-2xl overflow-hidden">
          {/* Product header */}
          <div className="flex items-start justify-between px-5 py-4 border-b border-[#f0e8d8]" style={{ background: '#faf7f2' }}>
            {editingId === product.id ? (
              <div className="flex-1 space-y-2 mr-4">
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full border border-[#e8dcc8] rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-[#c8973a]"
                  placeholder="商品名稱"
                />
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full border border-[#e8dcc8] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#c8973a]"
                  placeholder="商品描述（選填）"
                />

                {/* Image upload in edit mode */}
                <div className="space-y-1.5">
                  {editImageUrl ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[#e8dcc8] bg-[#faf7f2] p-2">
                      <img src={editImageUrl} alt="預覽" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] text-[#a07840]">{editImageUrl}</p>
                        <div className="mt-1 flex gap-2">
                          <label className="cursor-pointer text-xs font-semibold text-[#c8973a] hover:underline">
                            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
                              disabled={editUploading}
                              onChange={e => void handleEditImageChange(e.target.files?.[0] ?? null)} />
                            {editUploading ? '上傳中...' : '重新上傳'}
                          </label>
                          <button type="button" onClick={() => setEditImageUrl(null)}
                            className="text-xs text-red-400 hover:text-red-600 font-semibold">
                            移除圖片
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#d6c3a0] bg-[#fcf8f1] px-4 py-3 text-xs text-[#6b4c1e] hover:border-[#c8973a]">
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
                        disabled={editUploading}
                        onChange={e => void handleEditImageChange(e.target.files?.[0] ?? null)} />
                      {editUploading ? '圖片上傳中...' : '＋ 上傳商品圖片'}
                    </label>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(product.id)}
                    disabled={editSaving || editUploading || !editTitle.trim()}
                    className="text-xs font-bold text-white px-3 py-1 rounded-lg disabled:opacity-50"
                    style={{ background: '#2c1f0e' }}
                  >
                    {editSaving ? '儲存中...' : '儲存'}
                  </button>
                  <button onClick={cancelEdit} className="text-xs text-[#a07840] hover:text-ink px-2">取消</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-start gap-4 min-w-0">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[#e8dcc8] bg-[#f7f2e8]">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">🫘</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-ink text-base">{product.title}</h3>
                  {product.description && (
                    <p className="text-xs text-[#a07840] mt-0.5 line-clamp-2">{product.description}</p>
                  )}
                  {product.imageUrl && (
                    <p className="mt-1 truncate text-[11px] text-[#b08b53]">{product.imageUrl}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2 flex-shrink-0 ml-4">
              {editingId !== product.id && (
                <button
                  onClick={() => startEdit(product)}
                  className="text-xs text-[#a07840] hover:text-ink font-semibold"
                >
                  ✏️ 編輯
                </button>
              )}
              <button
                onClick={() => handleDelete(product.id, product.title)}
                disabled={deleting === product.id}
                className="text-xs text-red-400 hover:text-red-600 font-semibold disabled:opacity-40"
              >
                {deleting === product.id ? '刪除中...' : '刪除'}
              </button>
            </div>
          </div>

          {/* Variants table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f7f2e8] text-[#a07840] text-xs">
                  <th className="text-left px-5 py-2 font-semibold">規格</th>
                  <th className="text-right px-4 py-2 font-semibold">售價</th>
                  <th className="text-center px-4 py-2 font-semibold">庫存</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {product.variants.map(v => {
                  const editVal = stockEdits[v.id]
                  const isDirty = editVal !== undefined && parseInt(editVal) !== v.stock
                  const isLow   = v.stock <= 5
                  return (
                    <tr key={v.id} className={`border-t border-[#f0e8d8] ${isLow ? 'bg-red-50/40' : 'hover:bg-[#fffdf5]'}`}>
                      <td className="px-5 py-3 font-medium text-ink">
                        {v.unitName}
                        {isLow && v.stock > 0 && <span className="ml-1.5 text-[10px] text-red-500 font-bold">低庫存</span>}
                        {v.stock === 0 && <span className="ml-1.5 text-[10px] text-red-600 font-black">缺貨</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#c8973a]">${v.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={editVal ?? v.stock}
                          onChange={e => setStockEdits(s => ({ ...s, [v.id]: e.target.value }))}
                          className="w-20 text-center border border-[#e8dcc8] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#c8973a]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {isDirty ? (
                          <button
                            onClick={() => handleStockSave(v.id, product.id)}
                            disabled={saving[v.id]}
                            className="text-xs font-bold text-white px-3 py-1 rounded-lg disabled:opacity-50"
                            style={{ background: '#c8973a' }}
                          >
                            {saving[v.id] ? '儲存中' : '儲存'}
                          </button>
                        ) : (
                          <span className={`text-xs font-semibold ${v.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {v.stock === 0 ? '缺貨' : '有貨'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
