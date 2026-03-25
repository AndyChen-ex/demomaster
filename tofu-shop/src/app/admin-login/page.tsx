'use client'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [user, setUser]     = useState('')
  const [pass, setPass]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError(''); setLoading(true)
    const res  = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass }),
    })
    const data = await res.json()
    if (res.ok) {
      window.location.href = '/admin'
    } else {
      setError(data.error || '帳號或密碼錯誤')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f7f2e8' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-[#e8dcc8] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#f0e8d8] text-center" style={{ background: '#2c1f0e' }}>
            <div className="text-3xl mb-2">🫘</div>
            <h1 className="text-white font-black text-lg">後台管理登入</h1>
            <p className="text-white/40 text-xs mt-1">有德豆腐 · ADMIN</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#a07840] block mb-1">帳號</label>
              <input value={user} onChange={e => setUser(e.target.value)}
                placeholder="admin"
                className="w-full border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8973a]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#a07840] block mb-1">密碼</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8973a]" />
            </div>
            {error && <p className="text-red-500 text-xs font-semibold">⚠️ {error}</p>}
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 transition-all hover:opacity-90"
              style={{ background: '#2c1f0e' }}>
              {loading ? '驗證中...' : '登入後台'}
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-[#a07840] mt-4">
          <a href="/" className="hover:text-[#c8973a]">← 回前台</a>
        </p>
      </div>
    </div>
  )
}
