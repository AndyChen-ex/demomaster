import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const variant = await db.productVariant.update({
    where: { id: params.id },
    data: {
      ...(body.stock  !== undefined && { stock: body.stock }),
      ...(body.price  !== undefined && { price: body.price }),
      ...(body.unitName !== undefined && { unitName: body.unitName }),
    },
  })
  return NextResponse.json({ ...variant, price: Number(variant.price) })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await db.productVariant.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
