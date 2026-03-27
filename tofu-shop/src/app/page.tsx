import db from '@/lib/db'
import ProductGrid from '@/components/shop/ProductGrid'
import CartSidebar from '@/components/shop/CartSidebar'
import PromoBanner from '@/components/shop/PromoBanner'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const raw = await db.product.findMany({
    include: { variants: true },
    orderBy: { title: 'asc' },
  })
  const products = raw.map(p => ({
    ...p,
    variants: p.variants.map(v => ({ ...v, price: Number(v.price) })),
  }))

  const banners = await db.banner.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <>
      <PromoBanner banners={banners} />

      {/* Shop */}
      <main id="shop" className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-px bg-[#c8973a]" />
          <span className="text-sm tracking-widest text-[#c8973a] font-bold uppercase">精選商品</span>
        </div>
        <h2 className="font-black text-ink mb-2" style={{ fontSize: 'clamp(22px,4vw,32px)' }}>今日現貨，湊單免運</h2>
        <p className="text-sm text-[#a07840] mb-8">選好份量加入購物車，湊滿 $1,200 自動免運。</p>
        <ProductGrid products={products} />
      </main>

      {/* Footer */}
      <footer style={{ background: '#2c1f0e' }} className="text-center py-8 text-white/30 text-sm tracking-widest">
        © 有德豆腐 · ARTISAN TOFU
        <a href="/admin" className="ml-6 hover:text-[#c8973a] transition-colors">後台管理</a>
      </footer>

      <CartSidebar />
    </>
  )
}
