import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const COOKIE = 'tofu_admin'
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? 'admin-fallback-secret'
)

export async function POST(req: NextRequest) {
  const { user, pass } = await req.json()

  const validUser = process.env.ADMIN_USER ?? 'admin'
  const validPass = process.env.ADMIN_PASS ?? 'tofu1234'

  if (user !== validUser || pass !== validPass) {
    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 })
  }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(SECRET)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, token, {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 8,
  })
  return res
}
