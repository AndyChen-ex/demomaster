import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { signToken, COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()
  if (!email || !password) return NextResponse.json({ error: '請填寫信箱與密碼' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: '密碼至少 6 個字元' }, { status: 400 })

  const exists = await db.member.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: '此信箱已註冊' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const member = await db.member.create({
    data: { id: randomUUID(), email, password: hashed, name: name?.trim() || null },
  })

  const token = await signToken({ id: member.id, email: member.email, name: member.name })
  const res = NextResponse.json({ ok: true, name: member.name, email: member.email })
  res.cookies.set(COOKIE, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}
