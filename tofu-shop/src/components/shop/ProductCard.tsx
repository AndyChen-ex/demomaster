'use client'
import { useEffect, useState } from 'react'
import { ProductData } from '@/lib/types'
import { useCart } from '@/context/CartContext'

const getEmoji = () => '🫘'

export default function ProductCard({ product }: { product: ProductData }) {
  const { addItem } = useCart()
  const [selectedIdx, setSelectedIdx] = useState(product.variants.length - 1)
  const [flash, setFlash] = useState(false)
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const variant = product.variants[selectedIdx]

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!variant) return
    setQuantity(current => {
      if (variant.stock <= 0) return 1
      return Math.min(Math.max(current, 1), variant.stock)
    })
  }, [variant])

  if (!variant) return null

  const outOfStock = variant.stock <= 0
  const totalPrice = variant.price * quantity

  const handleAdd = () => {
    if (outOfStock) return

    addItem({
      variantId: variant.id,
      productId: product.id,
      productTitle: product.title,
      unitName: variant.unitName,
      price: variant.price,
      quantity,
    })

    setFlash(true)
    setTimeout(() => setFlash(false), 800)
  }

  const updateQuantity = (next: number) => {
    if (outOfStock) return
    const safe = Math.min(Math.max(next, 1), variant.stock)
    setQuantity(safe)
  }

  return (
    <>
      <div
        className={`relative flex h-full flex-col gap-3 rounded-2xl border-[1.5px] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
          ${flash ? 'border-[#c8973a] bg-[#fffdf5]' : 'border-[#e8dcc8] hover:border-[#c8973a]'}`}
      >
        {flash && (
          <span className="absolute right-2 top-2 rounded-full bg-[#c8973a] px-2 py-0.5 text-sm font-bold text-white">
            已加入
          </span>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-col gap-3 text-left"
        >
          <div className="overflow-hidden rounded-2xl border border-[#efe4d0] bg-[#f8f3ea]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-5xl text-center">
                {getEmoji()}
              </div>
            )}
          </div>

          <div className="font-bold text-[17px] text-ink">{product.title}</div>

          <div className="text-2xl font-black text-[#c8973a]">
            ${variant.price.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-[#a07840]">/ {variant.unitName}</span>
          </div>

          <div className="text-sm text-[#a07840]">
            {outOfStock ? <span className="font-semibold text-red-500">缺貨中</span> : `庫存 ${variant.stock}`}
          </div>

          <div className="text-sm font-semibold text-[#a07840] underline underline-offset-4">
            查看詳情
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1f0e]/55 px-4 py-6">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-[#fffaf3] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl text-[#6b4c1e] shadow-sm transition hover:bg-white"
            >
              ×
            </button>

            <div className="grid gap-6 p-5 md:grid-cols-[1.1fr_0.9fr] md:p-8">
              <div className="overflow-hidden rounded-[24px] border border-[#eadcc6] bg-white">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-[320px] w-full object-cover md:h-[460px]"
                  />
                ) : (
                  <div className="flex h-[320px] items-center justify-center bg-[#f8f3ea] text-7xl md:h-[460px]">
                    {getEmoji()}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm font-bold uppercase tracking-[0.28em] text-[#b08b53]">
                      商品詳情
                    </div>
                    <h3 className="text-3xl font-black leading-tight text-ink">{product.title}</h3>
                  </div>

                  {product.description && (
                    <div className="rounded-2xl border border-[#eadcc6] bg-white px-4 py-3">
                      <div className="mb-1 text-sm font-bold tracking-[0.2em] text-[#b08b53]">商品描述</div>
                      <p className="text-sm leading-7 text-[#6b4c1e]">{product.description}</p>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-sm font-bold tracking-[0.2em] text-[#b08b53]">選擇規格</div>
                    <div className="grid grid-cols-2 gap-2">
                      {product.variants.map((v, i) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedIdx(i)}
                          className={`rounded-2xl border px-3 py-3 text-left transition
                            ${i === selectedIdx
                              ? 'border-[#c8973a] bg-[#fff3da] text-[#6b4c1e]'
                              : 'border-[#e8dcc8] bg-white text-[#8d6b38] hover:border-[#d7b16d]'}`}
                        >
                          <div className="text-sm font-bold">{v.unitName}</div>
                          <div className="mt-1 text-lg font-black text-[#c8973a]">${v.price.toLocaleString()}</div>
                          <div className="mt-1 text-sm">
                            {v.stock > 0 ? `庫存 ${v.stock}` : '缺貨'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-bold tracking-[0.2em] text-[#b08b53]">購買數量</div>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#eadcc6] bg-white px-3 py-3">
                      <button
                        type="button"
                        onClick={() => updateQuantity(quantity - 1)}
                        disabled={outOfStock || quantity <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8dcc8] text-xl text-[#6b4c1e] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, variant.stock)}
                        value={quantity}
                        onChange={e => updateQuantity(Number(e.target.value) || 1)}
                        disabled={outOfStock}
                        className="h-11 w-20 rounded-xl border border-[#e8dcc8] text-center text-lg font-bold text-ink focus:border-[#c8973a] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f3eee3]"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(quantity + 1)}
                        disabled={outOfStock || quantity >= variant.stock}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8dcc8] text-xl text-[#6b4c1e] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                      <div className="ml-auto text-right text-sm text-[#a07840]">
                        {outOfStock ? '無庫存' : `最多 ${variant.stock}`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#2c1f0e] p-5 text-white">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em] text-white/50">已選規格</div>
                      <div className="mt-1 text-sm font-semibold text-white/80">{variant.unitName}</div>
                      <div className="mt-1 text-sm text-white/60">數量 {quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm uppercase tracking-[0.2em] text-white/50">小計</div>
                      <div className="mt-1 text-3xl font-black text-[#f0c060]">${totalPrice.toLocaleString()}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAdd()
                      setOpen(false)
                    }}
                    disabled={outOfStock}
                    className={`mt-5 w-full rounded-2xl py-3 text-sm font-bold tracking-[0.15em] transition
                      ${outOfStock
                        ? 'cursor-not-allowed bg-white/20 text-white/40'
                        : 'bg-[#f0c060] text-[#2c1f0e] hover:bg-[#ffd37c]'}`}
                  >
                    {outOfStock ? '缺貨中' : '加入購物車'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="關閉商品詳情"
            onClick={() => setOpen(false)}
            className="absolute inset-0 -z-10"
          />
        </div>
      )}
    </>
  )
}
