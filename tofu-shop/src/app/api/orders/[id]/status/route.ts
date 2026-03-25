import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

const VALID = ['preparing', 'shipped', 'delivered']

// PUT: admin updates order status
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await req.json()
  if (!VALID.includes(status)) return NextResponse.json({ error: '無效狀態' }, { status: 400 })

  const order = await db.order.update({
    where: { id: params.id },
    data: { status },
  })
  return NextResponse.json({ ok: true, status: order.status })
}
