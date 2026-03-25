import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { title, description, imageUrl } = body
  const product = await db.product.update({
    where: { id: params.id },
    data: {
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(imageUrl    !== undefined && { imageUrl }),
    },
  })
  return NextResponse.json(product)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await db.product.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
