import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(coupons.map(c => ({
    ...c,
    expiresAt: c.expiresAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  })))
}

export async function POST(req: NextRequest) {
  const { code, discount, expiresAt } = await req.json()
  if (!code?.trim() || !discount || !expiresAt)
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })

  const upper = (code as string).trim().toUpperCase()
  try {
    const coupon = await db.coupon.create({
      data: { id: randomUUID(), code: upper, discount: Number(discount), expiresAt: new Date(expiresAt) },
    })
    return NextResponse.json({ ...coupon, expiresAt: coupon.expiresAt.toISOString(), createdAt: coupon.createdAt.toISOString() }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '優惠碼已存在' }, { status: 409 })
  }
}
