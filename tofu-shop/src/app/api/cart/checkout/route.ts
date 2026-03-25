import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items, shipping, payment, couponCode, name, phone, address } = body as {
    items: { variantId: string; quantity: number; priceAtPurchase: number }[]
    shipping: string; payment: string; couponCode?: string
    name?: string; phone?: string; address?: string
  }

  if (!items?.length) return NextResponse.json({ error: '購物車是空的' }, { status: 400 })

  const session = await getSession()
  const memberId = session?.id ?? null

  // Validate coupon from DB
  let discount = 0
  if (couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
    if (!coupon) return NextResponse.json({ error: '優惠券無效' }, { status: 400 })
    if (coupon.expiresAt < new Date()) return NextResponse.json({ error: '優惠券已過期' }, { status: 400 })
    discount = coupon.discount
  }

  const subtotal = items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0)
  const total = Math.max(subtotal - discount, 0)
  const orderId = randomUUID()
  const outOfStock: string[] = []

  try {
    await db.$transaction(async tx => {
      for (const item of items) {
        const v = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        if (!v || v.stock < item.quantity) outOfStock.push(item.variantId)
      }
      if (outOfStock.length > 0) throw new Error('OUT_OF_STOCK')

      await tx.order.create({
        data: {
          id: orderId, shipping, payment,
          couponCode: couponCode || null, discount, subtotal, total,
          name: name || null, phone: phone || null, address: address || null,
          memberId,
          items: {
            create: items.map(i => ({
              variantId: i.variantId, quantity: i.quantity, priceAtPurchase: i.priceAtPurchase,
            })),
          },
        },
      })
      for (const item of items) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } })
      }
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'OUT_OF_STOCK')
      return NextResponse.json({ error: '部分商品庫存不足', outOfStock }, { status: 409 })
    throw e
  }

  return NextResponse.json({ orderId, discount, subtotal, total })
}
