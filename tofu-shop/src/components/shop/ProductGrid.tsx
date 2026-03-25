'use client'
import { ProductData } from '@/lib/types'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }: { products: ProductData[] }) {
  if (!products.length) {
    return (
      <div className="text-center py-20 text-[#a07840]">
        <div className="text-5xl mb-4">🫘</div>
        <p className="text-lg font-semibold">目前尚無商品</p>
        <p className="text-sm mt-1">請至後台新增商品</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
