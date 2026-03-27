import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(banners)
}

export async function POST(req: Request) {
  const { text, active, sortOrder } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: '請輸入橫幅文字' }, { status: 400 })
  const banner = await db.banner.create({
    data: { text: text.trim(), active: active ?? true, sortOrder: sortOrder ?? 0 },
  })
  return NextResponse.json(banner)
}
