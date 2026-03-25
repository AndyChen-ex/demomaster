import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  await prisma.orderItem.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()

  const products = [
    { title: '嫩豆腐', description: '質地細嫩滑順，適合涼拌、味噌湯', variants: [{ unitName: '半斤', price: 30, stock: 50 }, { unitName: '一斤', price: 55, stock: 30 }] },
    { title: '板豆腐', description: '扎實有嚼勁，適合煎、炒、紅燒', variants: [{ unitName: '半斤', price: 35, stock: 40 }, { unitName: '一斤', price: 65, stock: 25 }] },
    { title: '豆漿', description: '每日現磨，無添加，濃郁香醇', variants: [{ unitName: '250ml', price: 25, stock: 80 }, { unitName: '500ml', price: 45, stock: 60 }, { unitName: '1000ml', price: 80, stock: 20 }] },
    { title: '五香豆干', description: '滷製入味，彈牙Q嫩', variants: [{ unitName: '半斤', price: 60, stock: 35 }, { unitName: '一斤', price: 110, stock: 15 }] },
    { title: '豆包', description: '外脆內嫩，適合火鍋或煎炸', variants: [{ unitName: '半斤', price: 50, stock: 45 }, { unitName: '一斤', price: 95, stock: 20 }] },
  ]

  for (const p of products) {
    await prisma.product.create({
      data: { title: p.title, description: p.description, variants: { create: p.variants } },
    })
  }
  console.log(`✓ Seeded ${products.length} products`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
