'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const id    = params.get('id')    ?? ''
  const total = params.get('total') ?? '0'

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f7f2e8' }}>
      <div className="w-full max-w-md text-center">

        {/* Success icon */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-lg"
          style={{ background: 'linear-gradient(135deg,#2c1f0e,#6b4c1e)' }}>
          ✓
        </div>

        <h1 className="text-3xl font-black text-ink mb-2">訂單成立！</h1>
        <p className="text-[#a07840] mb-6">感謝您的訂購，我們將盡快為您準備出貨。</p>

        <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5 mb-6 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#a07840] font-semibold">訂單編號</span>
            <span className="font-mono text-sm font-bold text-ink">{id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center border-t border-[#f0e8d8] pt-3">
            <span className="text-sm font-bold text-ink">應付金額</span>
            <span className="text-xl font-black text-[#c8973a]">${Number(total).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[#fdf3e0] border border-[#f0c060]/40 rounded-xl p-4 text-sm text-[#6b4c1e] text-left mb-8 space-y-1">
          <p className="font-bold text-sm text-[#a07840] mb-2 uppercase tracking-wider">後續步驟</p>
          <p>1. 請依付款方式完成付款</p>
          <p>2. 我們確認後將簡訊通知出貨</p>
          <p>3. 如有問題請來電：02-1234-5678</p>
        </div>

        <Link href="/"
          className="block w-full py-3.5 rounded-2xl text-white font-bold tracking-wider transition-all hover:opacity-90"
          style={{ background: '#2c1f0e' }}>
          繼續選購 →
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
