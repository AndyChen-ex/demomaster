'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Member { id: string; email: string; name?: string }

export default function SiteHeader() {
  const router = useRouter()
  const [member, setMember]   = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)     // dropdown

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { setMember(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setMember(null)
    setOpen(false)
    router.refresh()
  }

  const displayName = member?.name || member?.email?.split('@')[0] || ''

  return (
    <div style={{ background: '#1a1008' }} className="sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between border-b border-white/5 shadow-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <span className="text-xl">🫘</span>
        <div>
          <span className="text-white font-black text-sm leading-none group-hover:text-[#f0c060] transition-colors">
            有德豆腐
          </span>
          <span className="text-white/30 text-sm tracking-widest ml-2">ARTISAN TOFU</span>
        </div>
      </Link>

      {/* Right: member area */}
      <div className="relative">
        {loading ? (
          <div className="w-20 h-6 rounded-full bg-white/10 animate-pulse" />
        ) : member ? (
          <>
            {/* Avatar button */}
            <button onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#c8973a]/50 transition-all">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: '#c8973a' }}>
                {displayName[0]?.toUpperCase()}
              </div>
              <span className="text-white text-sm font-semibold max-w-[100px] truncate">{displayName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Dropdown */}
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[#e8dcc8] bg-white shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#f0e8d8]" style={{ background: '#faf7f2' }}>
                    <p className="text-sm font-bold text-ink truncate">{member.name || '會員'}</p>
                    <p className="text-sm text-[#a07840] truncate">{member.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink hover:bg-[#f7f2e8] transition-colors font-semibold">
                    會員中心
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-semibold border-t border-[#f0e8d8]">
                    登出
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <Link href="/login"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-white border border-white/15 hover:border-[#c8973a] hover:text-[#f0c060] transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            登入 / 註冊
          </Link>
        )}
      </div>
    </div>
  )
}
