import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  // Create demo teams
  const demoTeam = await prisma.team.upsert({
    where: { code: 'DEMO_TEAM' },
    update: {},
    create: {
      name: 'Demo Team',
      code: 'DEMO_TEAM',
      description: 'Demo team for testing',
      region: 'US'
    }
  })

  // Create demo seller user
  const hashedPassword = await bcrypt.hash('password123', 12)
  const demoSeller = await prisma.user.upsert({
    where: { email: 'seller@demo.com' },
    update: {},
    create: {
      username: 'demoseller',
      name: 'Demo Seller',
      email: 'seller@demo.com',
      password: hashedPassword,
      phone: '+1-555-0123',
      isActive: true,
      emailVerified: new Date()
    }
  })

  // Assign seller role
  const sellerRole = await prisma.role.findUnique({
    where: { code: 'SELLER' }
  })

  if (sellerRole) {
    await prisma.userRoles.upsert({
      where: {
        userId_roleId: {
          userId: demoSeller.id,
          roleId: sellerRole.id
        }
      },
      update: {},
      create: {
        userId: demoSeller.id,
        roleId: sellerRole.id
      }
    })
  }

  // Add seller to team
  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: demoSeller.id,
        teamId: demoTeam.id
      }
    },
    update: {},
    create: {
      userId: demoSeller.id,
      teamId: demoTeam.id,
      isLeader: false
    }
  })

  // Create demo stores
  const tiktokStore = await prisma.store.upsert({
    where: { 
      id: 'demo_tiktok_store'
    },
    update: {},
    create: {
      id: 'demo_tiktok_store',
      name: 'TikTok Demo Shop',
      platform: 'TIKTOK_SHOP',
      sellerId: demoSeller.id,
      teamId: demoTeam.id,
      isActive: true,
      storeUrl: 'https://shop.tiktok.com/demo',
      webhookUrl: 'https://api.demo.com/webhooks/tiktok',
      settings: {
        autoFulfillment: true
      }
    }
  })

  const shopifyStore = await prisma.store.upsert({
    where: { 
      id: 'demo_shopify_store'
    },
    update: {},
    create: {
      id: 'demo_shopify_store',
      name: 'Shopify Demo Store',
      platform: 'SHOPIFY',
      sellerId: demoSeller.id,
      teamId: demoTeam.id,
      isActive: true,
      storeUrl: 'https://demo-store.myshopify.com',
      webhookUrl: 'https://api.demo.com/webhooks/shopify',
      settings: {
        autoFulfillment: true
      }
    }
  })

  // Create demo designs
  const tshirtDesign = await prisma.design.upsert({
    where: { fingerprint: 'demo_tshirt_design_001' },
    update: {},
    create: {
      name: 'Awesome T-Shirt Design',
      fingerprint: 'demo_tshirt_design_001',
      fileUrl: 'https://demo-assets.com/designs/tshirt-001.png',
      printReadyFile: 'https://demo-assets.com/designs/tshirt-001-print.png',
      thumbnailUrl: 'https://demo-assets.com/designs/tshirt-001-thumb.png',
      sellerId: demoSeller.id,
      teamId: demoTeam.id,
      status: 'APPROVED',
      tags: ['trendy', 'cool', 'summer'],
      artworkData: {
        designType: 'graphic',
        colors: ['#FF5733', '#33FF57', '#3357FF']
      },
      printSpecs: {
        method: 'DTG',
        resolution: '300dpi',
        colors: 3
      },
      metadata: {
        designType: 'graphic',
        difficulty: 'medium'
      }
    }
  })

  const hoodiDesign = await prisma.design.upsert({
    where: { fingerprint: 'demo_hoodie_design_002' },
    update: {},
    create: {
      name: 'Cool Hoodie Design',
      fingerprint: 'demo_hoodie_design_002',
      fileUrl: 'https://demo-assets.com/designs/hoodie-002.png',
      printReadyFile: 'https://demo-assets.com/designs/hoodie-002-print.png',
      thumbnailUrl: 'https://demo-assets.com/designs/hoodie-002-thumb.png',
      sellerId: demoSeller.id,
      teamId: demoTeam.id,
      status: 'APPROVED',
      tags: ['winter', 'cozy', 'streetwear'],
      artworkData: {
        designType: 'typography',
        colors: ['#000000', '#FFFFFF']
      },
      printSpecs: {
        method: 'Screen Print',
        resolution: '300dpi',
        colors: 2
      },
      metadata: {
        designType: 'typography',
        difficulty: 'easy'
      }
    }
  })

  // Create demo products
  const tshirtProduct = await prisma.product.upsert({
    where: { 
      storeId_sku: {
        storeId: tiktokStore.id,
        sku: 'TSH-AWE-001'
      }
    },
    update: {},
    create: {
      name: 'Awesome Graphic T-Shirt',
      description: 'Premium quality t-shirt with unique graphic design',
      sku: 'TSH-AWE-001',
      storeId: tiktokStore.id,
      category: 'apparel',
      basePrice: 24.99,
      costPrice: 12.50,
      weight: 0.180,
      isActive: true,
      tags: ['trendy', 'cool', 'summer'],
      dimensions: {
        length: 28,
        width: 20,
        height: 0.5
      }
    }
  })

  const hoodieProduct = await prisma.product.upsert({
    where: { 
      storeId_sku: {
        storeId: shopifyStore.id,
        sku: 'HOD-COZ-001'
      }
    },
    update: {},
    create: {
      name: 'Cozy Typography Hoodie',
      description: 'Warm hoodie with stylish typography design',
      sku: 'HOD-COZ-001',
      storeId: shopifyStore.id,
      category: 'apparel',
      basePrice: 49.99,
      costPrice: 25.00,
      weight: 0.450,
      isActive: true,
      tags: ['winter', 'cozy', 'streetwear'],
      dimensions: {
        length: 30,
        width: 22,
        height: 1.0
      }
    }
  })

  // Create demo orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'TIKTOK_ORD_001',
      storeId: tiktokStore.id,
      customerName: 'John Customer',
      customerEmail: 'john@customer.com',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      subtotal: 39.98,
      shippingCost: 5.99,
      tax: 3.20,
      discount: 0.00,
      total: 49.17,
      currency: 'USD',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US'
      },
      billingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US'
      },
      notes: 'Please pack carefully',
      metadata: {
        source: 'tiktok_shop',
        urgentDelivery: false
      }
    }
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'SHOPIFY_ORD_002',
      storeId: shopifyStore.id,
      customerName: 'Jane Buyer',
      customerEmail: 'jane@buyer.com',
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      subtotal: 79.98,
      shippingCost: 7.99,
      tax: 7.04,
      discount: 5.00,
      total: 90.01,
      currency: 'USD',
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US'
      },
      billingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US'
      },
      notes: 'Rush order - customer needs by Friday',
      metadata: {
        source: 'shopify',
        urgentDelivery: true
      }
    }
  })

  // Link products to designs
  await prisma.productDesign.create({
    data: {
      productId: tshirtProduct.id,
      designId: tshirtDesign.id,
      placement: 'front',
      settings: {
        position: 'center',
        size: 'large'
      }
    }
  })

  await prisma.productDesign.create({
    data: {
      productId: hoodieProduct.id,
      designId: hoodiDesign.id,
      placement: 'front',
      settings: {
        position: 'center',
        size: 'medium'
      }
    }
  })

  // Create order items
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: tshirtProduct.id,
      designId: tshirtDesign.id,
      quantity: 2,
      unitPrice: 19.99,
      totalPrice: 39.98,
      artworkData: {
        designUrl: 'https://demo-assets.com/designs/tshirt-001.png',
        placement: 'front',
        size: 'full-width'
      },
      printSpecs: {
        method: 'DTG',
        colors: ['#FF5733', '#33FF57', '#3357FF'],
        resolution: '300dpi'
      },
      metadata: {
        size: 'L',
        color: 'Black',
        printPosition: 'Center Front'
      }
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: hoodieProduct.id,
      designId: hoodiDesign.id,
      quantity: 2,
      unitPrice: 39.99,
      totalPrice: 79.98,
      artworkData: {
        designUrl: 'https://demo-assets.com/designs/hoodie-002.png',
        placement: 'front-back',
        size: 'large'
      },
      printSpecs: {
        method: 'Screen Print',
        colors: ['#000000', '#FFFFFF'],
        resolution: '300dpi'
      },
      metadata: {
        size: 'XL',
        color: 'Navy Blue',
        printPosition: 'Center Front and Back'
      }
    }
  })

  console.log('✅ Demo data seeded successfully!')
  console.log(`📊 Created:`)
  console.log(`  - 1 team: ${demoTeam.name}`)
  console.log(`  - 1 seller: ${demoSeller.name}`)
  console.log(`  - 2 stores: ${tiktokStore.name}, ${shopifyStore.name}`)
  console.log(`  - 2 designs: ${tshirtDesign.name}, ${hoodiDesign.name}`)
  console.log(`  - 2 products: ${tshirtProduct.name}, ${hoodieProduct.name}`)
  console.log(`  - 2 orders with order items`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })