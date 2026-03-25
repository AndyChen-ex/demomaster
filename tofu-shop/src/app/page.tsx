import db from '@/lib/db'
import ProductGrid from '@/components/shop/ProductGrid'
import CartSidebar from '@/components/shop/CartSidebar'

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

  return (
    <>
      {/* Progress bar */}

      {/* Hero */}
      <header className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden" style={{ background: '#2c1f0e' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(200,151,58,0.15) 0%,transparent 70%)' }} />
        <div className="relative z-10 text-center px-6 py-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 border border-[#c8973a]/40 rounded-full px-4 py-1.5 text-sm tracking-widest text-[#f0c060] mb-8">
            ◆ 職人生鮮豆類 ◆
          </div>
          <h1 className="text-white font-black leading-none mb-4" style={{ fontSize: 'clamp(48px,10vw,88px)' }}>
            <span className="text-[#c8973a]">有德</span>豆腐
          </h1>
          <p className="text-white/50 tracking-widest text-sm mb-8">ARTISAN TOFU · 嚴選非基改大豆</p>
          <div className="w-12 h-0.5 mx-auto mb-8" style={{ background: 'linear-gradient(90deg,transparent,#c8973a,transparent)' }} />
          <p className="text-white/80 leading-relaxed text-lg">
            吃素，<strong className="text-[#f0c060]">不應只有一種選擇。</strong><br />
            從一塊豆腐開始，還原餐桌的多樣可能。
          </p>
        </div>
        <a href="#shop" className="absolute bottom-8 text-white/30 text-sm tracking-widest flex flex-col items-center gap-2 animate-bounce">
          選購商品
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"/></svg>
        </a>
      </header>

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

      {/* Story */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#c8973a]" />
            <span className="text-sm tracking-widest text-[#c8973a] font-bold uppercase">我們的理念</span>
            <div className="w-8 h-px bg-[#c8973a]" />
          </div>
          <blockquote className="text-xl leading-loose text-ink font-medium">
            不論是為了<strong className="text-[#c8973a]">健康</strong>或<strong className="text-[#c8973a]">信仰</strong>而選擇蔬食，<br />
            您都值得在餐桌上擁有更豐富的變化。<br />
            <span className="text-sm text-[#a07840] font-normal">我們相信，透明的資訊本身，就是一種尊重。</span>
          </blockquote>
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['✓ 非基改大豆選項','✓ 基改/非基改明確標示','✓ 產地可溯源','✓ 無添加防腐劑'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full text-sm font-semibold border border-[#e8dcc8] text-[#6b4c1e] bg-[#f7f2e8]">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#2c1f0e' }} className="text-center py-8 text-white/30 text-sm tracking-widest">
        © 有德豆腐 · ARTISAN TOFU
        <a href="/admin" className="ml-6 hover:text-[#c8973a] transition-colors">後台管理</a>
      </footer>

      <CartSidebar />
    </>
  )
}
