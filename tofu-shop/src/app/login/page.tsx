'use client'
import { useState } from 'react'
import Link from 'next/link'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode]       = useState<Mode>('login')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) { setError('請填寫信箱與密碼'); return }

    setLoading(true)
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password } : { email, password, name }

    try {
      const res  = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '操作失敗'); return }
      window.location.href = '/'
    } catch {
      setError('網路錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f7f2e8' }}>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Mode toggle */}
          <div className="flex bg-white border border-[#e8dcc8] rounded-2xl p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${mode === m ? 'text-white shadow' : 'text-[#a07840] hover:text-ink'}`}
                style={mode === m ? { background: '#2c1f0e' } : {}}>
                {m === 'login' ? '會員登入' : '註冊帳號'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#e8dcc8] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#f0e8d8]" style={{ background: '#faf7f2' }}>
              <h1 className="font-black text-ink text-xl">
                {mode === 'login' ? '歡迎回來 👋' : '建立帳號 🌱'}
              </h1>
              <p className="text-sm text-[#a07840] mt-1">
                {mode === 'login' ? '登入以享會員專屬優惠' : '加入我們，享受更好的購物體驗'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {mode === 'register' && (
                <Field label="姓名" value={name} onChange={setName} placeholder="王小明" />
              )}
              <Field label="電子信箱 *" value={email} onChange={setEmail}
                placeholder="you@example.com" type="email" />
              <Field label="密碼 *" value={password} onChange={setPass}
                placeholder={mode === 'register' ? '至少 6 個字元' : '請輸入密碼'} type="password"
                onEnter={handleSubmit} />

              {error && (
                <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wide disabled:opacity-60 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: loading ? '#a07840' : '#2c1f0e' }}>
                {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
              </button>

              {mode === 'login' && (
                <p className="text-center text-sm text-[#a07840]">
                  還沒有帳號？
                  <button onClick={() => { setMode('register'); setError('') }}
                    className="text-[#c8973a] font-bold ml-1 hover:underline">
                    立即註冊
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-[#a07840] mt-4">
            <Link href="/" className="hover:text-[#c8973a]">← 不登入，繼續逛逛</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', onEnter }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string; onEnter?: () => void
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#a07840] block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        className="w-full border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8973a] bg-white"
      />
    </div>
  )
}
