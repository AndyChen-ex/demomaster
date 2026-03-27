'use client'
import { useState } from 'react'

interface Banner {
  id: string
  text: string
  active: boolean
  sortOrder: number
}

export default function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)

  async function addBanner() {
    if (!newText.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText, active: true, sortOrder: banners.length }),
    })
    const banner = await res.json()
    setBanners(b => [...b, banner])
    setNewText('')
    setSaving(false)
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    setBanners(b => b.map(x => x.id === id ? { ...x, active: !active } : x))
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return
    await fetch(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText.trim() }),
    })
    setBanners(b => b.map(x => x.id === id ? { ...x, text: editText.trim() } : x))
    setEditingId(null)
  }

  async function deleteBanner(id: string) {
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    setBanners(b => b.filter(x => x.id !== id))
  }

  async function moveUp(index: number) {
    if (index === 0) return
    const updated = [...banners]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    const reordered = updated.map((b, i) => ({ ...b, sortOrder: i }))
    setBanners(reordered)
    await Promise.all(reordered.map(b =>
      fetch(`/api/admin/banners/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      })
    ))
  }

  async function moveDown(index: number) {
    if (index === banners.length - 1) return
    const updated = [...banners]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    const reordered = updated.map((b, i) => ({ ...b, sortOrder: i }))
    setBanners(reordered)
    await Promise.all(reordered.map(b =>
      fetch(`/api/admin/banners/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      })
    ))
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      {banners.filter(b => b.active).length > 0 && (
        <div style={{ background: '#c8973a' }} className="w-full py-2.5 px-4 rounded-xl text-center">
          <p className="text-[#2c1f0e] text-sm font-bold">
            預覽：{banners.filter(b => b.active).map(b => b.text).join('　｜　')}
          </p>
        </div>
      )}

      {/* Add new */}
      <div className="bg-white rounded-xl border border-[#e8dcc8] p-4">
        <div className="text-sm font-bold text-ink mb-3">新增橫幅</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addBanner()}
            placeholder="例：🎉 本週滿 $1,200 免運費"
            className="flex-1 border border-[#e8dcc8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8973a]"
          />
          <button
            onClick={addBanner}
            disabled={saving || !newText.trim()}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40 transition-opacity"
            style={{ background: '#c8973a' }}>
            新增
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {banners.length === 0 && (
          <div className="text-center py-10 text-[#a07840] text-sm">尚無橫幅，點上方新增</div>
        )}
        {banners.map((banner, i) => (
          <div key={banner.id}
            className={`bg-white rounded-xl border p-4 flex items-center gap-3 transition-opacity ${banner.active ? 'border-[#c8973a]/40' : 'border-[#e8dcc8] opacity-60'}`}>
            {/* Order buttons */}
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveUp(i)} disabled={i === 0}
                className="text-[#a07840] hover:text-ink disabled:opacity-20 text-xs leading-none">▲</button>
              <button onClick={() => moveDown(i)} disabled={i === banners.length - 1}
                className="text-[#a07840] hover:text-ink disabled:opacity-20 text-xs leading-none">▼</button>
            </div>

            {/* Text / Edit */}
            <div className="flex-1 min-w-0">
              {editingId === banner.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(banner.id); if (e.key === 'Escape') setEditingId(null) }}
                  className="w-full border border-[#c8973a] rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                />
              ) : (
                <p className="text-sm text-ink truncate">{banner.text}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Active toggle */}
              <button onClick={() => toggleActive(banner.id, banner.active)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${banner.active ? 'bg-green-100 text-green-700' : 'bg-[#f0e8d8] text-[#a07840]'}`}>
                {banner.active ? '顯示中' : '已隱藏'}
              </button>

              {/* Edit / Save */}
              {editingId === banner.id ? (
                <>
                  <button onClick={() => saveEdit(banner.id)}
                    className="text-xs font-bold text-[#c8973a] hover:text-[#2c1f0e]">儲存</button>
                  <button onClick={() => setEditingId(null)}
                    className="text-xs text-[#a07840] hover:text-ink">取消</button>
                </>
              ) : (
                <button onClick={() => { setEditingId(banner.id); setEditText(banner.text) }}
                  className="text-xs font-bold text-[#a07840] hover:text-ink">編輯</button>
              )}

              {/* Delete */}
              <button onClick={() => deleteBanner(banner.id)}
                className="text-xs text-red-400 hover:text-red-600 font-bold">刪除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
