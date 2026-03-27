import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const banner = await db.banner.update({
    where: { id: params.id },
    data: {
      ...(data.text !== undefined  && { text: data.text }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  })
  return NextResponse.json(banner)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.banner.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
