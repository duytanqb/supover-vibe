import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateVariantCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function main() {
  console.log('Adding more demo variants...')

  // Get existing data
  const products = await prisma.product.findMany()
  const factories = await prisma.factory.findMany()

  if (products.length === 0 || factories.length === 0) {
    console.log('No products or factories found. Please run basic seed first.')
    return
  }

  const tshirtProduct = products.find(p => p.name.includes('T-Shirt')) || products[0]
  const hoodieProduct = products.find(p => p.name.includes('Hoodie')) || products[1] || products[0]
  const posterProduct = products.find(p => p.name.includes('Poster')) || products[2] || products[0]

  const gearmentFactory = factories.find(f => f.name === 'Gearment')
  const pressifyFactory = factories.find(f => f.name === 'Pressify')

  // Additional System Variants with 5-character codes
  const newSystemVariants = [
    // T-Shirt variants
    {
      code: generateVariantCode(),
      productId: tshirtProduct.id,
      name: 'Medium / Black',
      size: 'M',
      color: 'Black',
      material: 'Cotton',
      style: 'Crew Neck',
      price: 18.99,
      costPrice: 7.50,
      stock: 150,
      isActive: true
    },
    {
      code: generateVariantCode(),
      productId: tshirtProduct.id,
      name: 'Small / White',
      size: 'S',
      color: 'White',
      material: 'Cotton',
      style: 'Crew Neck',
      price: 17.99,
      costPrice: 7.00,
      stock: 200,
      isActive: true
    },
    {
      code: generateVariantCode(),
      productId: tshirtProduct.id,
      name: 'XL / Navy',
      size: 'XL',
      color: 'Navy',
      material: 'Cotton Blend',
      style: 'V-Neck',
      price: 21.99,
      costPrice: 8.50,
      stock: 80,
      isActive: true
    }
  ]

  // Create hoodie variants if we have a hoodie product
  if (hoodieProduct && hoodieProduct.id !== tshirtProduct.id) {
    newSystemVariants.push(
      {
        code: generateVariantCode(),
        productId: hoodieProduct.id,
        name: 'Large / Gray',
        size: 'L',
        color: 'Gray',
        material: 'Cotton Fleece',
        style: 'Pullover',
        price: 39.99,
        costPrice: 18.00,
        stock: 75,
        isActive: true
      },
      {
        code: generateVariantCode(),
        productId: hoodieProduct.id,
        name: 'Medium / Black',
        size: 'M',
        color: 'Black',
        material: 'Cotton Fleece',
        style: 'Zip-Up',
        price: 42.99,
        costPrice: 19.50,
        stock: 60,
        isActive: true
      }
    )
  }

  // Create poster variants if we have a poster product
  if (posterProduct && posterProduct.id !== tshirtProduct.id && posterProduct.id !== hoodieProduct.id) {
    newSystemVariants.push(
      {
        code: generateVariantCode(),
        productId: posterProduct.id,
        name: '12x18 / Matte',
        size: '12x18',
        color: 'White',
        material: 'Paper',
        style: 'Matte Finish',
        price: 15.99,
        costPrice: 4.50,
        stock: 300,
        isActive: true
      },
      {
        code: generateVariantCode(),
        productId: posterProduct.id,
        name: '16x20 / Glossy',
        size: '16x20',
        color: 'White',
        material: 'Photo Paper',
        style: 'Glossy Finish',
        price: 22.99,
        costPrice: 6.75,
        stock: 180,
        isActive: true
      }
    )
  }

  // Create system variants
  const createdSystemVariants = []
  for (const variant of newSystemVariants) {
    const created = await prisma.systemVariant.create({
      data: variant
    })
    createdSystemVariants.push(created)
    console.log(`Created system variant: ${created.code} - ${created.name}`)
  }

  // Create supplier variants for each system variant
  const supplierVariantsData = []

  for (const systemVariant of createdSystemVariants) {
    // Gearment supplier variants
    if (gearmentFactory) {
      supplierVariantsData.push({
        factoryId: gearmentFactory.id,
        systemVariantCode: systemVariant.code,
        supplierProductCode: `GEAR-${systemVariant.code}`,
        supplierVariantCode: `${systemVariant.size || 'OS'}-${systemVariant.color || 'DEF'}`,
        supplierSku: `GEAR-${systemVariant.code}-${systemVariant.size || 'OS'}-${systemVariant.color || 'DEF'}`,
        supplierName: `Gearment ${systemVariant.name}`,
        size: systemVariant.size,
        color: systemVariant.color,
        material: systemVariant.material,
        style: systemVariant.style,
        supplierPrice: systemVariant.costPrice * 0.9, // Slightly lower than cost price
        minimumQuantity: Math.floor(Math.random() * 5) + 1,
        leadTime: Math.floor(Math.random() * 7) + 2,
        isAvailable: true,
        lastSyncedAt: new Date()
      })
    }

    // Pressify supplier variants (with different pricing)
    if (pressifyFactory) {
      supplierVariantsData.push({
        factoryId: pressifyFactory.id,
        systemVariantCode: systemVariant.code,
        supplierProductCode: `PRESS-${systemVariant.code}`,
        supplierVariantCode: `${systemVariant.size || 'OS'}_${systemVariant.color || 'DEF'}`,
        supplierSku: `PRESS-${systemVariant.code}-${systemVariant.size || 'OS'}_${systemVariant.color || 'DEF'}`,
        supplierName: `Pressify ${systemVariant.name}`,
        size: systemVariant.size,
        color: systemVariant.color,
        material: systemVariant.material,
        style: systemVariant.style,
        supplierPrice: systemVariant.costPrice * 1.1, // Slightly higher than cost price
        minimumQuantity: Math.floor(Math.random() * 10) + 5,
        leadTime: Math.floor(Math.random() * 5) + 3,
        isAvailable: Math.random() > 0.2, // 80% availability
        lastSyncedAt: new Date()
      })
    }
  }

  // Create all supplier variants
  for (const supplierData of supplierVariantsData) {
    const created = await prisma.supplierVariant.create({
      data: supplierData
    })
    console.log(`Created supplier variant: ${created.supplierSku} for system code: ${created.systemVariantCode}`)
  }

  console.log(`Successfully added ${createdSystemVariants.length} system variants and ${supplierVariantsData.length} supplier variants`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })