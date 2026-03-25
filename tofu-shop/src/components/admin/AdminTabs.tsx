'use client'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import ProductList from './ProductList'
import CouponManager from './CouponManager'
import OrderManager from './OrderManager'
import { ProductData } from '@/lib/types'

interface Coupon {
  id: string; code: string; discount: number; expiresAt: string; createdAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  tab: string
  products: ProductData[]
  coupons: Coupon[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabsInner({ tab, products, coupons, orders }: Props) {
  const router = useRouter()

  const tabs = [
    { key: 'products', label: '📦 商品管理' },
    { key: 'coupons',  label: '🎟️ 優惠碼' },
    { key: 'orders',   label: '📋 訂單管理' },
  ]

  return (
    <div>
      <div className="flex gap-1 bg-white border border-[#e8dcc8] rounded-xl p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => router.push(`/admin?tab=${t.key}`)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${tab === t.key ? 'text-white shadow-sm' : 'text-[#a07840] hover:text-ink'}`}
            style={tab === t.key ? { background: '#2c1f0e' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && <ProductList initialProducts={products} />}
      {tab === 'coupons'  && <CouponManager initialCoupons={coupons} />}
      {tab === 'orders'   && <OrderManager initialOrders={orders} />}
    </div>
  )
}

export default function AdminTabs(props: Props) {
  return (
    <Suspense>
      <TabsInner {...props} />
    </Suspense>
  )
}
