import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'
import { signToken, COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: '請填寫信箱與密碼' }, { status: 400 })

  const member = await db.member.findUnique({ where: { email } })
  if (!member) return NextResponse.json({ error: '信箱或密碼錯誤' }, { status: 401 })

  const ok = await bcrypt.compare(password, member.password)
  if (!ok) return NextResponse.json({ error: '信箱或密碼錯誤' }, { status: 401 })

  const token = await signToken({ id: member.id, email: member.email, name: member.name })
  const res = NextResponse.json({ ok: true, name: member.name, email: member.email })
  res.cookies.set(COOKIE, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}
