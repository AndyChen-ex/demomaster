export interface ProductVariantData {
  id: string
  productId: string
  unitName: string
  price: number
  stock: number
}

export interface ProductData {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  variants: ProductVariantData[]
}

export interface CartItem {
  variantId: string
  productId: string
  productTitle: string
  unitName: string
  price: number
  quantity: number
}
