import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: '請輸入優惠碼' }, { status: 400 })

  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon) return NextResponse.json({ error: '優惠碼不存在' }, { status: 404 })
  if (coupon.expiresAt < new Date()) return NextResponse.json({ error: '此優惠碼已過期' }, { status: 400 })

  return NextResponse.json({ code: coupon.code, discount: coupon.discount })
}
