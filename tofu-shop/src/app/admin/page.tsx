import db from '@/lib/db'
import AdminTabs from '@/components/admin/AdminTabs'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const validTabs = ['products', 'coupons', 'orders']
  const tab = validTabs.includes(searchParams.tab ?? '') ? searchParams.tab! : 'products'

  const rawProducts = await db.product.findMany({
    include: { variants: true },
    orderBy: { title: 'asc' },
  })
  const products = rawProducts.map(p => ({
    ...p,
    variants: p.variants.map(v => ({ ...v, price: Number(v.price) })),
  }))

  const rawCoupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  const coupons = rawCoupons.map(c => ({
    ...c,
    expiresAt: c.expiresAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }))

  const rawOrders = await db.order.findMany({
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  const orders = rawOrders.map(o => ({
    ...o,
    discount:  Number(o.discount),
    subtotal:  Number(o.subtotal),
    total:     Number(o.total),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map(i => ({ ...i, priceAtPurchase: Number(i.priceAtPurchase) })),
  }))

  const totalProducts  = products.length
  const totalVariants  = products.reduce((s, p) => s + p.variants.length, 0)
  const lowStock       = products.flatMap(p => p.variants).filter(v => v.stock <= 5).length
  const activeCoupons  = coupons.filter(c => new Date(c.expiresAt) > new Date()).length
  const pendingOrders  = orders.filter(o => o.status === 'preparing').length

  return (
    <div className="min-h-screen" style={{ background: '#f7f2e8' }}>
      <div style={{ background: '#2c1f0e' }} className="px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🫘</span>
          <div>
            <div className="text-white font-bold text-base leading-none">有德豆腐</div>
            <div className="text-white/40 text-xs tracking-widest mt-0.5">後台管理</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-[#c8973a] hover:text-[#f0c060] transition-colors">← 回前台</Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="text-xs text-white/40 hover:text-white transition-colors">登出</button>
          </form>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: '商品總數',   value: totalProducts, emoji: '📦', warn: false },
            { label: '規格總數',   value: totalVariants, emoji: '🏷️', warn: false },
            { label: '低庫存警示', value: lowStock,      emoji: '⚠️', warn: lowStock > 0 },
            { label: '有效優惠碼', value: activeCoupons, emoji: '🎟️', warn: false },
            { label: '待處理訂單', value: pendingOrders, emoji: '📋', warn: pendingOrders > 0 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-[#e8dcc8] text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className={`text-2xl font-black ${s.warn ? 'text-red-500' : 'text-ink'}`}>{s.value}</div>
              <div className="text-xs text-[#a07840] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <AdminTabs tab={tab} products={products} coupons={coupons} orders={orders} />
      </main>
    </div>
  )
}
