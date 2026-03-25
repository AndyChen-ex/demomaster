import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  const products = await db.product.findMany({
    include: { variants: true },
    orderBy: { title: 'asc' },
  })
  const serialized = products.map(p => ({
    ...p,
    variants: p.variants.map(v => ({ ...v, price: Number(v.price) })),
  }))
  return NextResponse.json(serialized)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, imageUrl, variants } = body

  if (!title || !variants?.length) {
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
  }

  const product = await db.product.create({
    data: {
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      variants: {
        create: variants.map((v: { unitName: string; price: number; stock: number }) => ({
          unitName: v.unitName,
          price: v.price,
          stock: v.stock ?? 0,
        })),
      },
    },
    include: { variants: true },
  })

  const serialized = {
    ...product,
    variants: product.variants.map(v => ({ ...v, price: Number(v.price) })),
  }
  return NextResponse.json(serialized, { status: 201 })
}
