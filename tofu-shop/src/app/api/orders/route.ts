import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET: member's own orders
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '請先登入' }, { status: 401 })

  const orders = await db.order.findMany({
    where: { memberId: session.id },
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = orders.map(o => ({
    ...o,
    discount:  Number(o.discount),
    subtotal:  Number(o.subtotal),
    total:     Number(o.total),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map(i => ({
      ...i,
      priceAtPurchase: Number(i.priceAtPurchase),
    })),
  }))

  return NextResponse.json(serialized)
}
