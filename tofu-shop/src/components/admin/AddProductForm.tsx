'use client'
import { useState } from 'react'
import { ProductData } from '@/lib/types'

interface Props { onAdded: (p: ProductData) => void }

interface VariantRow { unitName: string; price: string; stock: string }

const EMPTY_VARIANT: VariantRow = { unitName: '', price: '', stock: '' }

export default function AddProductForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [variants, setVariants] = useState<VariantRow[]>([{ ...EMPTY_VARIANT }])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const addVariant = () => setVariants(v => [...v, { ...EMPTY_VARIANT }])
  const removeVariant = (i: number) => setVariants(v => v.filter((_, idx) => idx !== i))
  const updateVariant = (i: number, field: keyof VariantRow, value: string) =>
    setVariants(v => v.map((row, idx) => idx === i ? { ...row, [field]: value } : row))

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setImageUrl('')
    setVariants([{ ...EMPTY_VARIANT }])
    setError('')
  }

  const handleImageChange = async (file: File | null) => {
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '圖片上傳失敗')
      }

      setImageUrl(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '圖片上傳失敗')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!title.trim()) {
      setError('請輸入商品名稱')
      return
    }

    if (variants.some(v => !v.unitName.trim() || !v.price)) {
      setError('請完整填寫所有規格名稱與價格')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl || null,
          variants: variants.map(v => ({
            unitName: v.unitName.trim(),
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || '新增商品失敗')
      }

      const product = await res.json()
      onAdded(product)
      resetForm()
      setOpen(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '新增商品失敗')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
        style={{ background: '#c8973a' }}
      >
        + 新增商品
      </button>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#e8dcc8] bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">新增商品</h3>
        <button
          onClick={() => {
            resetForm()
            setOpen(false)
          }}
          className="text-xl text-[#a07840] hover:text-ink"
          type="button"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#a07840]">商品名稱 *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例如：手工板豆腐"
            className="w-full rounded-lg border border-[#e8dcc8] px-3 py-2 text-sm focus:border-[#c8973a] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[#a07840]">商品描述</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="補充商品特色、口感或適合料理方式"
            className="w-full resize-none rounded-lg border border-[#e8dcc8] px-3 py-2 text-sm focus:border-[#c8973a] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[#a07840]">商品圖片</label>
          <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#d6c3a0] bg-[#fcf8f1] px-4 py-4 text-sm text-[#6b4c1e] transition-colors hover:border-[#c8973a]">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={e => void handleImageChange(e.target.files?.[0] ?? null)}
              disabled={uploading}
            />
            {uploading ? '圖片上傳中...' : imageUrl ? '更換商品圖片' : '選擇商品圖片'}
          </label>

          {imageUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#e8dcc8] bg-[#faf7f2]">
              <img
                src={imageUrl}
                alt="商品預覽"
                className="h-40 w-full object-cover"
              />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="truncate text-[11px] text-[#a07840]">{imageUrl}</span>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="ml-3 text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  移除
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold text-[#a07840]">商品規格 *</label>
          <button
            onClick={addVariant}
            className="text-xs font-bold text-[#c8973a] hover:underline"
            type="button"
          >
            + 新增規格
          </button>
        </div>

        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={v.unitName}
                onChange={e => updateVariant(i, 'unitName', e.target.value)}
                placeholder="規格，例如：300g"
                className="flex-1 rounded-lg border border-[#e8dcc8] px-3 py-2 text-sm focus:border-[#c8973a] focus:outline-none"
              />
              <input
                value={v.price}
                onChange={e => updateVariant(i, 'price', e.target.value)}
                placeholder="價格"
                type="number"
                min="0"
                className="w-24 rounded-lg border border-[#e8dcc8] px-3 py-2 text-sm focus:border-[#c8973a] focus:outline-none"
              />
              <input
                value={v.stock}
                onChange={e => updateVariant(i, 'stock', e.target.value)}
                placeholder="庫存"
                type="number"
                min="0"
                className="w-20 rounded-lg border border-[#e8dcc8] px-3 py-2 text-sm focus:border-[#c8973a] focus:outline-none"
              />
              {variants.length > 1 && (
                <button
                  onClick={() => removeVariant(i)}
                  className="text-lg text-red-400 hover:text-red-600"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-2 px-1 text-[10px] text-[#a07840]">
            <span className="flex-1">規格名稱</span>
            <span className="w-24">價格 ($)</span>
            <span className="w-20">庫存</span>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || uploading}
        className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all disabled:opacity-60"
        style={{ background: '#2c1f0e' }}
        type="button"
      >
        {loading ? '新增中...' : '建立商品'}
      </button>
    </div>
  )
}
