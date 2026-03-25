import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import SiteHeader from '@/components/SiteHeader'
import ShippingProgressBar from '@/components/shop/ShippingProgressBar'

export const metadata: Metadata = {
  title: '有德豆腐 | 職人生鮮豆類',
  description: '嚴選非基改大豆，資訊透明，來源清楚。滿 $1,200 免運費。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="pb-12">
        <CartProvider>
          <SiteHeader />
          {children}
          <ShippingProgressBar />
        </CartProvider>
      </body>
    </html>
  )
}
