import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'
import { getSession, signToken, COOKIE } from '@/lib/auth'

// PATCH: update name or password
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '請先登入' }, { status: 401 })

  const { name, currentPassword, newPassword } = await req.json()

  const member = await db.member.findUnique({ where: { id: session.id } })
  if (!member) return NextResponse.json({ error: '會員不存在' }, { status: 404 })

  const updateData: { name?: string; password?: string } = {}

  // Update name
  if (name !== undefined) {
    updateData.name = name.trim() || null
  }

  // Update password
  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: '請輸入目前密碼' }, { status: 400 })
    if (newPassword.length < 6) return NextResponse.json({ error: '新密碼至少 6 個字元' }, { status: 400 })
    const ok = await bcrypt.compare(currentPassword, member.password)
    if (!ok) return NextResponse.json({ error: '目前密碼錯誤' }, { status: 400 })
    updateData.password = await bcrypt.hash(newPassword, 10)
  }

  const updated = await db.member.update({ where: { id: session.id }, data: updateData })

  // Re-issue token with updated name
  const token = await signToken({ id: updated.id, email: updated.email, name: updated.name })
  const res = NextResponse.json({ ok: true, name: updated.name, email: updated.email })
  res.cookies.set(COOKIE, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}
